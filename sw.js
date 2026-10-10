const VERSION = 'pdf-matrix-v1';
const SHELL = [
  './', './index.html', './multi.html', './unir.html', './comprimir.html', './proteger.html',
  './escaner.html', './convertir.html', './manifest.webmanifest', './assets/matrix.css',
  './assets/matrix.js', './assets/qpdf.js', './assets/qpdf.wasm', './assets/icon.svg', './offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('pdf-matrix-') && key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      event.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((cache) => cache.put(req, copy)); return res; }).catch(async () => (await caches.match(req)) || (await caches.match('./offline.html'))));
      return;
    }
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => { if (res.ok) caches.open(VERSION).then((cache) => cache.put(req, res.clone())); return res; })));
    return;
  }
  if (!['script', 'worker', 'style', 'font', 'empty'].includes(req.destination) && !/\.wasm(?:\?|$)|traineddata(?:\?|$)/i.test(url.href)) return;
  event.respondWith(caches.open('pdf-matrix-runtime-v1').then(async (cache) => {
    const cached = await cache.match(req);
    try {
      const fresh = await fetch(req);
      if (fresh.ok || fresh.type === 'opaque') cache.put(req, fresh.clone()).catch(() => {});
      return fresh;
    } catch (e) {
      if (cached) return cached;
      throw e;
    }
  }));
});
