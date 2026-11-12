/* Mis Finanzas: funciona sin conexión. Siempre intenta bajar la versión nueva; si no hay internet, usa la guardada. */
const PREFIX = 'mis-finanzas-';
const CACHE = PREFIX + 'v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './fondo-cara.png'])).catch(() => {}));
});
self.addEventListener('activate', e => {
  // solo borra versiones viejas de esta app: el sitio comparte las cachés con Mis Hábitos
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf(PREFIX) === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(m => m || caches.match('./index.html')))
  );
});
