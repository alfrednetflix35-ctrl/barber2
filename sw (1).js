/* Service Worker de Club The Elegance.
   Permite instalar la app y abrir la página sin conexión.
   Los datos (Firebase) nunca se guardan aquí: siempre van a la red.
   Al publicar cambios importantes, sube el número de VERSION. */
const VERSION = "v4";
const CACHE = "elegance-" + VERSION;
const PRECACHE = ["/", "/index.html", "/admin", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png", "/icons/apple-touch-icon.png", "/icons/favicon-96.png", "/manifest-admin.webmanifest", "/icons/admin-192.png", "/icons/admin-512.png", "/icons/admin-maskable-512.png", "/icons/admin-apple-touch-icon.png"];

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
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match(url.pathname.startsWith("/admin") ? "/admin" : "/index.html")))
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

/* Avisos del administrador: al tocar la notificación se abre el panel en Clientes */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    const w = ws.find(c => new URL(c.url).pathname.startsWith("/admin"));
    if (w) { w.navigate("/admin#clientes").catch(() => {}); return w.focus(); }
    return self.clients.openWindow("/admin#clientes");
  }));
});
