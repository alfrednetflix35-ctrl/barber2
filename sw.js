/* Service Worker de Club The Elegance.
   Permite instalar la app y abrir la página sin conexión.
   Los datos (Firebase) nunca se guardan aquí: siempre van a la red.
   Al publicar cambios importantes, sube el número de VERSION. */
const VERSION = "v1";
const CACHE = "elegance-" + VERSION;
const PRECACHE = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png", "/icons/apple-touch-icon.png", "/icons/favicon-96.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("elegance-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  const fuente = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !fuente) return; /* Firebase y demás: directo a la red */

  /* Páginas: primero la red (siempre lo más nuevo); sin internet, la copia guardada */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("/index.html")))
    );
    return;
  }
  /* Archivos estáticos y tipografías: usa la copia y la actualiza por detrás */
  e.respondWith(
    caches.match(req).then(hit => {
      const red = fetch(req).then(r => { if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => hit);
      return hit || red;
    })
  );
});
