/* Service worker: siempre busca la versión más nueva en internet; solo usa copia guardada si no hay conexión. */
const CACHE = "elegance-v3";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;   // Firebase y demás: directo a internet
  e.respondWith((async () => {
    try {
      const res = await fetch(r, { cache: "no-store" });
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(r, res.clone()); }
      return res;
    } catch (err) {
      const hit = await caches.match(r);
      if (hit) return hit;
      throw err;
    }
  })());
});
