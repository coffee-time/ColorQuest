const C = "colorsfind-v3";
const F = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "logo.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(F)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => clients.claim())
  );
});

// Cache d'abord, mise à jour en arrière-plan : la nouvelle version s'affiche au lancement suivant.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(m => {
      const n = fetch(e.request)
        .then(r => {
          if (r.ok || r.type === "opaque") {
            const c = r.clone();
            caches.open(C).then(x => x.put(e.request, c));
          }
          return r;
        })
        .catch(() => m);
      return m || n;
    })
  );
});
