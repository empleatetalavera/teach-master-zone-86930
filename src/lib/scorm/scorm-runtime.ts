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
 *   4) Parse imsmanifest.xml to determine the launch path (defaults to
 *      index.html if the manifest is absent or malformed).
 *   5) Post the file map to the SW (one MessageChannel round-trip per package).
 *   6) Return a same-origin iframe URL like /scorm-runtime/<packageId>/<launchPath>.
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
    console.log('[SCORM] Registering service worker at', SW_PATH);
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE });
    // Wait until there is an active worker (installed + activated).
    const ready = await navigator.serviceWorker.ready;
    console.log('[SCORM] Service worker ready, active:', !!ready.active);
    return ready;
  })();

  return swReadyPromise;
}

export type ScormRuntimeHandle = {
  /** Same-origin URL to use as the iframe `src`. */
  iframeSrc: string;
  /** Launch path detected from the manifest (or provided explicitly). */
  launchPath: string;
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
  /**
   * Override the launch file. If omitted, the runtime parses imsmanifest.xml
   * and uses the resource[default].href. Falls back to 'index.html'.
   */
  launchPath?: string;
  /** Signed URL TTL in seconds. Defaults to 1h. */
  signedUrlExpiresIn?: number;
};

/**
 * Parse imsmanifest.xml and return the launch href of the default
 * organization's first SCO resource. Returns null if the manifest is missing
 * or unparseable — the caller falls back to 'index.html'.
 */
async function detectLaunchPath(files: Map<string, Blob>): Promise<string | null> {
  const manifestKey =
    findKeyCaseInsensitive(files, 'imsmanifest.xml') ||
    findKeyCaseInsensitive(files, 'imsManifest.xml');
  if (!manifestKey) return null;

  const blob = files.get(manifestKey);
  if (!blob) return null;

  const xmlText = await blob.text();

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  } catch {
    return null;
  }
  if (doc.getElementsByTagName('parsererror').length > 0) return null;

  // Find default organization's first <item> referencing a resource.
  const orgs = doc.getElementsByTagName('organizations')[0];
  const defaultOrgId = orgs?.getAttribute('default');
  let firstItemRef: string | null = null;

  if (defaultOrgId) {
    const allOrgs = doc.getElementsByTagName('organization');
    for (let i = 0; i < allOrgs.length; i++) {
      if (allOrgs[i].getAttribute('identifier') === defaultOrgId) {
        const item = allOrgs[i].getElementsByTagName('item')[0];
        firstItemRef = item?.getAttribute('identifierref') ?? null;
        break;
      }
    }
  }
  if (!firstItemRef) {
    const item = doc.getElementsByTagName('item')[0];
    firstItemRef = item?.getAttribute('identifierref') ?? null;
  }

  // Find the resource with that identifier and return its href.
  const resources = doc.getElementsByTagName('resource');
  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    if (!firstItemRef || r.getAttribute('identifier') === firstItemRef) {
      const href = r.getAttribute('href');
      if (href) return href.replace(/^[./]+/, '');
    }
  }
  return null;
}

function findKeyCaseInsensitive(map: Map<string, unknown>, target: string): string | null {
  const lower = target.toLowerCase();
  for (const k of map.keys()) {
    if (k.toLowerCase() === lower) return k;
  }
  return null;
}

export async function loadScormPackage(opts: LoadScormPackageOptions): Promise<ScormRuntimeHandle> {
  const {
    packageId,
    filePath,
    storageBucket = 'scorm-packages',
    launchPath: explicitLaunchPath,
    signedUrlExpiresIn = 3600,
  } = opts;

  const reg = await ensureServiceWorker();

  // 1) Sign URL for the private bucket.
  console.log('[SCORM] Signing URL for', filePath);
  const { data: signed, error: signErr } = await supabase
    .storage
    .from(storageBucket)
    .createSignedUrl(filePath, signedUrlExpiresIn);
  if (signErr || !signed?.signedUrl) {
    throw new Error(`No se pudo firmar la URL del paquete SCORM: ${signErr?.message ?? 'unknown'}`);
  }

  // 2) Download.
  console.log('[SCORM] Downloading ZIP...');
  const resp = await fetch(signed.signedUrl);
  if (!resp.ok) {
    throw new Error(`Error descargando el ZIP del paquete (${resp.status}).`);
  }
  const buf = await resp.arrayBuffer();
  console.log('[SCORM] Downloaded', buf.byteLength, 'bytes');

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
  console.log('[SCORM] Unzipped', files.size, 'files');
  if (files.size === 0) {
    throw new Error('El paquete SCORM está vacío.');
  }

  // 4) Launch path: explicit > manifest > index.html.
  let launchPath: string;
  if (explicitLaunchPath) {
    launchPath = explicitLaunchPath;
  } else {
    launchPath = (await detectLaunchPath(files)) ?? 'index.html';
  }
  console.log('[SCORM] Launch path:', launchPath);

  // Validate that the file exists (case-insensitive) in the package.
  if (!files.has(launchPath) && !findKeyCaseInsensitive(files, launchPath)) {
    throw new Error(`El archivo de arranque "${launchPath}" no está en el paquete SCORM.`);
  }

  // 5) Send to SW (use registration.active so we don't depend on the parent
  //    being controlled by the SW — the iframe becomes a client by itself).
  await postToSW(reg, { type: 'REGISTER_PACKAGE', packageId, files }, 'PACKAGE_REGISTERED');
  console.log('[SCORM] Package registered in SW');

  // 6) Same-origin URL.
  const iframeSrc = `${SW_SCOPE}${encodeURIComponent(packageId)}/${launchPath}`;

  return {
    iframeSrc,
    launchPath,
    dispose: () => {
      postToSW(reg, { type: 'UNREGISTER_PACKAGE', packageId }, 'PACKAGE_UNREGISTERED').catch(() => {});
    },
  };
}

function postToSW(
  reg: ServiceWorkerRegistration,
  message: unknown,
  expectedReply: string,
  timeoutMs = 15000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const target = reg.active || reg.waiting || reg.installing || navigator.serviceWorker.controller;
    if (!target) {
      reject(new Error('Service Worker no está activo todavía. Recarga la página e inténtalo otra vez.'));
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
    target.postMessage(message, [channel.port2]);
  });
}
