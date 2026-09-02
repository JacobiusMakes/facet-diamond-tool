// Drag the generated link from the Facet page to a browser bookmark bar.
// It reads visible page text locally, then sends only the detected shape and carat to Facet.
(() => {
  const text = (document.body && document.body.innerText || "").slice(0, 250000);
  const caratPattern = /(\d{1,2}(?:\.\d{1,3})?)\s*(?:ct\b|cts\b|carat\b|carats\b|-carat\b)/gi;
  const shapes = [
    ["dutch_marquise", ["hexagonal modified brilliant", "dutch marquise", "elongated hexagon"]],
    ["emerald", ["emerald cut", "emerald"]],
    ["oval", ["oval brilliant", "oval"]],
    ["round", ["round brilliant", "round"]],
  ];
  let caratMatch = null;
  let shape = null;
  let candidate;
  while ((candidate = caratPattern.exec(text))) {
    if (!caratMatch) caratMatch = candidate;
    const nearby = text.slice(Math.max(0, candidate.index - 180), candidate.index + 180).toLowerCase();
    const nearbyShape = shapes.find((entry) => entry[1].some((term) => nearby.includes(term)));
    if (nearbyShape) {
      caratMatch = candidate;
      shape = nearbyShape;
      break;
    }
  }
  const destination = new URL("https://jacobiusmakes.github.io/facet-diamond-tool/");
  if (caratMatch) destination.searchParams.set("carat", caratMatch[1]);
  if (shape) destination.searchParams.set("shape", shape[0]);
  destination.searchParams.set("via", "bookmarklet");
  window.open(destination.toString(), "_blank", "noopener");
})();
