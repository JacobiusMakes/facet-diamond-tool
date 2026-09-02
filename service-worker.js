const CACHE = "facet-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./core.js",
  "./same-stone.html",
  "./same-stone-core.js",
  "./stone-on-hand.html",
  "./hand-preview-core.js",
  "./widget-demo.html",
  "./facet-widget.js",
  "./privacy.html",
  "./embed.html",
  "./manifest.webmanifest",
  "./output/pdf/facet-diamond-size-chart.pdf",
  "./outputs/facet-acquisition-2026-09-02/facet-diamond-shortlist.xlsx",
  "./icons/icon128.png",
  "./icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./")))
  );
});
