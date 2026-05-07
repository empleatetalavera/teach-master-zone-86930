// public/scorm-sw.js
// Service Worker that serves SCORM package contents from in-memory state.
//
// Scope: /scorm-runtime/
//
// Why this exists: SCORM SCOs cannot run in cross-origin iframes because the
// same-origin policy blocks window.parent.API access. By serving the SCO
// contents from the same origin as the parent app via this SW, the SCO and
// parent share an origin and SCORM API discovery works normally.
//
// Lifecycle:
//   1) Parent registers SW with scope /scorm-runtime/.
//   2) Parent unzips a SCORM package and posts {type:'REGISTER_PACKAGE',
//      packageId, files: Map<path, Blob>} to the SW.
//   3) Iframe loads /scorm-runtime/<packageId>/<launchPath>.
//   4) SW intercepts the fetch and returns the matching Blob.

/* eslint-disable no-restricted-globals */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const PACKAGES = new Map(); // packageId -> Map<relativePath, Blob>

self.addEventListener('message', (event) => {
  const { type, packageId, files } = event.data || {};
  const replyPort = event.ports && event.ports[0];

  if (type === 'REGISTER_PACKAGE' && packageId && files) {
    PACKAGES.set(packageId, files);
    if (replyPort) replyPort.postMessage({ type: 'PACKAGE_REGISTERED', packageId });
    return;
  }
  if (type === 'UNREGISTER_PACKAGE' && packageId) {
    PACKAGES.delete(packageId);
    if (replyPort) replyPort.postMessage({ type: 'PACKAGE_UNREGISTERED', packageId });
    return;
  }
  if (type === 'PING') {
    if (replyPort) replyPort.postMessage({ type: 'PONG' });
    return;
  }
});

const MIME_TYPES = {
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  mjs: 'application/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  ico: 'image/x-icon',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  eot: 'application/vnd.ms-fontobject',
  pdf: 'application/pdf',
  txt: 'text/plain; charset=utf-8',
};

function inferContentType(path) {
  const dot = path.lastIndexOf('.');
  if (dot < 0) return 'application/octet-stream';
  const ext = path.slice(dot + 1).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/scorm-runtime/')) return;

  const rest = url.pathname.slice('/scorm-runtime/'.length);
  const slash = rest.indexOf('/');
  if (slash < 0) {
    event.respondWith(new Response('Bad path', { status: 400 }));
    return;
  }
  const packageId = decodeURIComponent(rest.slice(0, slash));
  const filePath = decodeURIComponent(rest.slice(slash + 1));

  const pkg = PACKAGES.get(packageId);
  if (!pkg) {
    event.respondWith(new Response('Package not registered', { status: 404 }));
    return;
  }

  // Exact match first.
  let blob = pkg.get(filePath);

  // Fall back to case-insensitive lookup (some authoring tools mix cases).
  if (!blob) {
    const lower = filePath.toLowerCase();
    for (const [k, v] of pkg.entries()) {
      if (k.toLowerCase() === lower) { blob = v; break; }
    }
  }

  if (!blob) {
    event.respondWith(new Response('File not found in package', { status: 404 }));
    return;
  }

  event.respondWith(new Response(blob, {
    status: 200,
    headers: {
      'Content-Type': inferContentType(filePath),
      // Allow the parent to embed iframes from this origin without restrictions.
      'X-Content-Type-Options': 'nosniff',
    },
  }));
});
