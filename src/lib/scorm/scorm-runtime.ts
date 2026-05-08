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
    const reg = await navigator.serviceWorker.register(SW_PATH, {
      scope: SW_SCOPE,
      updateViaCache: 'none',
    });
    // Force update so an older cached SW doesn't keep serving stale logic.
    try { await reg.update(); } catch {}
    const ready = await waitForActiveRegistration(reg);
    console.log('[SCORM] Service worker registration active:', !!ready.active, 'state:', ready.active?.state);
    return ready;
  })();

  return swReadyPromise;
}

function waitForActiveRegistration(
  reg: ServiceWorkerRegistration,
  timeoutMs = 10000,
): Promise<ServiceWorkerRegistration> {
  if (reg.active) return Promise.resolve(reg);

  const worker = reg.installing || reg.waiting;
  if (!worker) return Promise.resolve(reg.update().then((updated) => waitForActiveRegistration(updated, timeoutMs)));

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      worker.removeEventListener('statechange', onStateChange);
      reject(new Error('El reproductor SCORM no pudo activar el Service Worker. Recarga la página e inténtalo de nuevo.'));
    }, timeoutMs);

    const onStateChange = () => {
      if (worker.state === 'activated' || reg.active) {
        window.clearTimeout(timeout);
        worker.removeEventListener('statechange', onStateChange);
        resolve(reg);
      }
    };

    worker.addEventListener('statechange', onStateChange);
    onStateChange();
  });
}

export type ScormTreeItem = {
  id: string;
  title: string;
  /** Same-origin URL relative to the SW scope. Null for branches without resource. */
  href: string | null;
  children: ScormTreeItem[];
};

export type ScormRuntimeHandle = {
  /** Same-origin URL to use as the iframe `src`. */
  iframeSrc: string;
  /** Launch path detected from the manifest (or provided explicitly). */
  launchPath: string;
  /** Same-origin URL prefix for this package: `${SW_SCOPE}${packageId}/`. */
  baseSrc: string;
  /** Course title from manifest organization (if any). */
  courseTitle: string | null;
  /** Hierarchical lesson tree (default organization). Empty if no manifest. */
  tree: ScormTreeItem[];
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
async function parseManifest(files: Map<string, Blob>): Promise<{
  launchPath: string | null;
  courseTitle: string | null;
  tree: ScormTreeItem[];
}> {
  const empty = { launchPath: null, courseTitle: null, tree: [] as ScormTreeItem[] };
  const manifestKey =
    findKeyCaseInsensitive(files, 'imsmanifest.xml') ||
    findKeyCaseInsensitive(files, 'imsManifest.xml');
  if (!manifestKey) return empty;

  const blob = files.get(manifestKey);
  if (!blob) return empty;

  const xmlText = await blob.text();
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  } catch {
    return empty;
  }
  if (doc.getElementsByTagName('parsererror').length > 0) return empty;

  // Build resource map: identifier -> href
  const resourceMap = new Map<string, string>();
  const resources = doc.getElementsByTagName('resource');
  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    const id = r.getAttribute('identifier');
    const href = r.getAttribute('href');
    if (id && href) resourceMap.set(id, href.replace(/^[./]+/, ''));
  }

  // Find default organization
  const orgs = doc.getElementsByTagName('organizations')[0];
  const defaultOrgId = orgs?.getAttribute('default');
  let defaultOrg: Element | null = null;
  const allOrgs = doc.getElementsByTagName('organization');
  for (let i = 0; i < allOrgs.length; i++) {
    if (!defaultOrgId || allOrgs[i].getAttribute('identifier') === defaultOrgId) {
      defaultOrg = allOrgs[i];
      break;
    }
  }
  if (!defaultOrg && allOrgs.length > 0) defaultOrg = allOrgs[0];

  const courseTitle = defaultOrg?.getElementsByTagName('title')[0]?.textContent?.trim() || null;

  const buildItem = (el: Element): ScormTreeItem => {
    const id = el.getAttribute('identifier') || crypto.randomUUID();
    const refId = el.getAttribute('identifierref');
    const title = el.getElementsByTagName('title')[0]?.textContent?.trim() || 'Sin título';
    const href = refId ? resourceMap.get(refId) ?? null : null;
    const children: ScormTreeItem[] = [];
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i];
      if (c.tagName.toLowerCase() === 'item') children.push(buildItem(c));
    }
    return { id, title, href, children };
  };

  const tree: ScormTreeItem[] = [];
  if (defaultOrg) {
    for (let i = 0; i < defaultOrg.children.length; i++) {
      const c = defaultOrg.children[i];
      if (c.tagName.toLowerCase() === 'item') tree.push(buildItem(c));
    }
  }

  // Determine launch path = first item with href (depth-first)
  const firstHref = (items: ScormTreeItem[]): string | null => {
    for (const it of items) {
      if (it.href) return it.href;
      const c = firstHref(it.children);
      if (c) return c;
    }
    return null;
  };

  return { launchPath: firstHref(tree), courseTitle, tree };
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
