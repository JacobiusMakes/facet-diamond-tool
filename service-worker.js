importScripts("./core.js");

const CACHE = "facet-v10";
const ASSETS = [
  "./",
  "./index.html",
  "./core.js",
  "./report-lens.html",
  "./report-lens.js",
  "./report-lens-core.js",
  "./vendor/pdfjs/pdf.min.mjs",
  "./vendor/pdfjs/pdf.worker.min.mjs",
  "./same-stone.html",
  "./same-stone-core.js",
  "./stone-on-hand.html",
  "./hand-preview-core.js",
  "./widget-demo.html",
  "./link-mint.html",
  "./vendor/qrcode/qrcode.js",
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
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method === "POST" && requestUrl.pathname.endsWith("/share-target")) {
    event.respondWith((async () => {
      const form = await event.request.formData();
      const sharedText = [form.get("title"), form.get("text"), form.get("url")].filter(Boolean).join(" ");
      const parsed = FacetCore.parseListing(sharedText);
      const target = new URL("./", self.registration.scope);
      target.searchParams.set("via", "share_target");
      if (parsed && parsed.shape && parsed.carat) {
        target.searchParams.set("shape", parsed.shape);
        target.searchParams.set("carat", parsed.carat.toFixed(2));
        target.searchParams.set("found", "1");
      }
      return Response.redirect(target.toString(), 303);
    })());
    return;
  }
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
