const assert = require("node:assert/strict");
const widget = require("../facet-widget.js");

assert.equal(widget.VERSION, "0.3.1");
assert.equal(widget.sanitizePublisher("Gemology Weekly!"), "gemology_weekly");
assert.equal(widget.sanitizePublisher(""), "publisher");
assert.equal(widget.normalizeShape("Dutch Marquise"), "dutch_marquise");
assert.equal(widget.clampCarat("99"), 20);

const result = widget.faceUpSize("oval", 1.5);
assert.equal(result.lengthMm.toFixed(1), "9.2");
assert.equal(result.widthMm.toFixed(1), "6.3");

const url = new URL(widget.trackedUrl("emerald", 2, "Ring Education"));
assert.equal(url.hostname, "stienhardt.com");
assert.equal(url.pathname, "/collections/emerald-cut-lab-grown-diamonds");
assert.equal(url.searchParams.get("utm_source"), "facet");
assert.equal(url.searchParams.get("utm_medium"), "shopping_tool");
assert.equal(url.searchParams.get("utm_content"), "web_component_ring_education");
assert.equal(url.searchParams.get("facet_shape"), "emerald");
assert.equal(url.searchParams.get("facet_carat"), "2.00");
assert.match(widget.outline("round"), /rx="45"/);
assert.match(widget.facetLines("round"), /M68 55/);
assert.match(widget.facetLines("oval"), /M22 55/);

console.log("Facet publisher widget tests passed");
