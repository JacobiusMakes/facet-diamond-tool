const assert = require("node:assert/strict");
const core = require("../core.js");

const oval = core.faceUpSize("oval", 1.5);
assert.equal(oval.shape, "oval");
assert.equal(oval.carat, 1.5);
assert.equal(oval.lengthMm.toFixed(1), "9.2");
assert.equal(oval.widthMm.toFixed(1), "6.3");

assert.equal(core.normalizeShape("Dutch Marquise"), "dutch_marquise");
assert.equal(core.normalizeShape("hexagonal modified brilliant"), "dutch_marquise");

const parsed = core.parseListing("Certified oval brilliant. This loose diamond weighs 1.72 carats.");
assert.deepEqual(
  { shape: parsed.shape, carat: parsed.carat, confidence: parsed.confidence },
  { shape: "oval", carat: 1.72, confidence: "shape_and_carat" }
);

const prioritizesNearbyShape = core.parseListing(
  "Round accent stones appear on the band. The center is a 2.05 ct emerald cut diamond."
);
assert.equal(prioritizesNearbyShape.shape, "emerald");
assert.equal(prioritizesNearbyShape.carat, 2.05);

const url = new URL(core.trackedCollectionUrl({ shape: "oval", carat: 1.5, content: "web match" }));
assert.equal(url.hostname, "stienhardt.com");
assert.equal(url.pathname, "/collections/oval-cut-lab-grown-diamonds");
assert.equal(url.searchParams.get("utm_source"), "facet");
assert.equal(url.searchParams.get("utm_medium"), "shopping_tool");
assert.equal(url.searchParams.get("utm_content"), "web_match");
assert.equal(url.searchParams.get("facet_shape"), "oval");
assert.equal(url.searchParams.get("facet_carat"), "1.50");

const brief = core.comparisonBrief("round", 2);
assert.match(brief, /Round/);
assert.match(brief, /2\.00 ct/);
assert.match(brief, /grading report/);

console.log("Facet core tests passed");
