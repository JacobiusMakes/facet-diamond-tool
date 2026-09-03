const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const page = fs.readFileSync(path.join(root, "stone-card.html"), "utf8");
const script = fs.readFileSync(path.join(root, "stone-card.js"), "utf8");
const calculator = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.match(page, /Facet Stone Card/);
assert.match(page, /width="1200" height="1500"/);
assert.match(page, /vendor\/qrcode\/qrcode\.js/);
assert.match(page, /qr-canvas\.js/);
assert.match(script, /FacetCore\.shareCardUrl/);
assert.match(script, /FacetQr\.draw/);
assert.match(script, /navigator\.canShare/);
assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|sendBeacon/);
assert.match(calculator, /share_card_match/);
assert.match(calculator, /stone-card\.html/);

console.log("Stone Card tests passed");
