/**
 * SCORM package runtime.
 *
 * Bridges Supabase Storage → in-memory file map → service worker → same-origin
 * URL for the iframe.
 *
 * Flow:
 *   1) Ensure the SCORM service worker is registered and active.
 *   2) Sign + download the ZIP from Supabase Storage.
 *   3) Unzip in memory with JSZip.
 *   4) Post the file map to the SW (one MessageChannel round-trip per package).
 *   5) Return a same-origin iframe URL like /scorm-runtime/<packageId>/index.html.
 *
 * The SW serves the iframe's fetches from the in-memory map, so the iframe is
 * same-origin with the parent and `window.parent.API` works for SCORM RTE.
 *
 * Add this dependency: npm install jszip
 */

import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';

const SW_PATH = '/scorm-sw.js';
const SW_SCOPE = '/scorm-runtime/';

let swReadyPromise: Promise<ServiceWorkerRegistration> | null = null;

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Tu navegador no soporta Service Workers, necesarios para reproducir SCORM.');
  }
  if (swReadyPromise) return swReadyPromise;

  swReadyPromise = (async () => {
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE });
    await navigator.serviceWorker.ready;

    // On first install, the SW is active but may not yet control this page.
    // Wait for it to claim, with a timeout fallback.
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        const onChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', onChange);
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', onChange);
        setTimeout(() => {
          navigator.serviceWorker.removeEventListener('controllerchange', onChange);
          resolve();
        }, 1500);
      });
    }
    return reg;
  })();

  return swReadyPromise;
}

export type ScormRuntimeHandle = {
  /** Same-origin URL to use as the iframe `src`. */
  iframeSrc: string;
  /** Removes the package from SW memory. Call on player unmount. */
  dispose: () => void;
};

export type LoadScormPackageOptions = {
  /** scorm_packages.id — used as the path segment after /scorm-runtime/. */
  packageId: string;
  /** scorm_packages.file_path — path in the Supabase Storage bucket. */
  filePath: string;
  /** Storage bucket name. Defaults to 'scorm-packages'. */
  storageBucket?: string;
  /** Launch file inside the ZIP. Defaults to 'index.html'. */
  launchPath?: string;
  /** Signed URL TTL in seconds. Defaults to 1h. */
  signedUrlExpiresIn?: number;
};

export async function loadScormPackage(opts: LoadScormPackageOptions): Promise<ScormRuntimeHandle> {
  const {
    packageId,
    filePath,
    storageBucket = 'scorm-packages',
    launchPath = 'index.html',
    signedUrlExpiresIn = 3600,
  } = opts;

  await ensureServiceWorker();

  // 1) Get a signed URL for the private bucket.
  const { data: signed, error: signErr } = await supabase
    .storage
    .from(storageBucket)
    .createSignedUrl(filePath, signedUrlExpiresIn);
  if (signErr || !signed?.signedUrl) {
    throw new Error(`No se pudo firmar la URL del paquete SCORM: ${signErr?.message ?? 'unknown'}`);
  }

  // 2) Download.
  const resp = await fetch(signed.signedUrl);
  if (!resp.ok) {
    throw new Error(`Error descargando el ZIP del paquete (${resp.status}).`);
  }
  const buf = await resp.arrayBuffer();

  // 3) Unzip in memory.
  const zip = await JSZip.loadAsync(buf);
  const files = new Map<string, Blob>();
  await Promise.all(
    Object.values(zip.files).map(async (entry) => {
      if (entry.dir) return;
      const content = await entry.async('blob');
      const normalised = entry.name.replace(/^[./]+/, '');
      files.set(normalised, content);
    })
  );

  if (files.size === 0) {
    throw new Error('El paquete SCORM está vacío.');
  }

  // 4) Send the map to the SW and wait for ack.
  await postToSW({ type: 'REGISTER_PACKAGE', packageId, files }, 'PACKAGE_REGISTERED');

  // 5) Return same-origin iframe URL.
  const iframeSrc = `${SW_SCOPE}${encodeURIComponent(packageId)}/${launchPath}`;

  return {
    iframeSrc,
    dispose: () => {
      // Best-effort cleanup; ignore errors.
      postToSW({ type: 'UNREGISTER_PACKAGE', packageId }, 'PACKAGE_UNREGISTERED').catch(() => {});
    },
  };
}

function postToSW(message: unknown, expectedReply: string, timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) {
      reject(new Error('Service Worker no controla la página todavía. Recarga e inténtalo otra vez.'));
      return;
    }
    const channel = new MessageChannel();
    const timeout = setTimeout(() => {
      reject(new Error(`Service Worker no respondió a tiempo (${expectedReply})`));
    }, timeoutMs);
    channel.port1.onmessage = (e) => {
      if (e.data?.type === expectedReply) {
        clearTimeout(timeout);
        resolve();
      }
    };
    controller.postMessage(message, [channel.port2]);
  });
}
