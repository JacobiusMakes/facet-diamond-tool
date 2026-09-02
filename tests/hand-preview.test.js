const assert = require("node:assert/strict");
require("../core.js");
const preview = require("../hand-preview-core.js");

assert.equal(preview.CARD_LONG_EDGE_MM, 85.6);
assert.equal(preview.pointDistance({ x: 0, y: 0 }, { x: 30, y: 40 }), 50);
assert.equal(preview.pixelsPerMillimeter({ x: 0, y: 0 }, { x: 856, y: 0 }), 10);
assert.equal(preview.pixelsPerMillimeter({ x: 0, y: 0 }, { x: 5, y: 0 }), null);

const oval = preview.overlaySize("oval", 1.5, 10);
assert.equal(oval.shape, "oval");
assert.equal(oval.lengthMm.toFixed(1), "9.2");
assert.equal(oval.widthMm.toFixed(1), "6.3");
assert.equal(oval.lengthPx.toFixed(1), "91.6");

assert.deepEqual(preview.fitInside(4000, 3000, 1600, 1200), { width: 1600, height: 1200, scale: 0.4 });
assert.equal(preview.shapePoints("emerald", 100, 60).length, 8);
assert.equal(preview.shapePoints("dutch_marquise", 100, 60).length, 6);

console.log("Stone on Hand tests passed");
