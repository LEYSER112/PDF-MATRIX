/* PDF Matrix · service worker
   Guarda la app en el dispositivo para que abra y funcione sin conexión.
   Si agregas archivos nuevos al proyecto, añádelos a LOCAL y cambia VERSION. */
const VERSION = 'v2';
const SHELL = `pdfmatrix-shell-${VERSION}`;
const RUNTIME = 'pdfmatrix-runtime-v1';

const LOCAL = [
  './', 'index.html', 'src/pages/index.html', 'src/pages/comprimir.html', 'src/pages/unir.html', 'src/pages/proteger.html', 'src/pages/imagenes.html', 'src/pages/escaner.html', 'src/pages/multi.html',
  'manifest.webmanifest', 'src/assets/css/matrix.css', 'src/assets/js/matrix.js', 'src/assets/qpdf.js', 'src/assets/qpdf.wasm',
  'src/assets/icons/icon.svg', 'src/assets/icons/icon-192.png', 'src/assets/icons/icon-512.png', 'src/assets/icons/icon-maskable-512.png', 'src/assets/icons/apple-touch-icon.png', 'src/assets/icons/favicon-32.png',
];
// Librerías externas que usa la app (se guardan al instalar; si alguna falla, se intentará guardar al usarla).
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'tessdata.projectnaptha.com', 'unpkg.com'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(LOCAL);
    await Promise.all(CDN.map((u) => cache.add(new Request(u)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('pdfmatrix-shell-') && k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

// Archivos de la app: primero la red (así siempre ves la versión nueva); sin conexión, la copia guardada.
async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await Promise.race([fetch(req), timeout(6000)]);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') { const home = await cache.match('index.html'); if (home) return home; }
    return Response.error();
  }
}
// Librerías y tipografías externas (versiones fijas): primero lo guardado.
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) (await caches.open(RUNTIME)).put(req, res.clone());
    return res;
  } catch (err) { return Response.error(); }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
  else if (CDN_HOSTS.includes(url.hostname)) e.respondWith(cacheFirst(req));
});
