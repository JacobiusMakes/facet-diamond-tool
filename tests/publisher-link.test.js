const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const page = fs.readFileSync(path.join(root, "link-mint.html"), "utf8");
const calculator = fs.readFileSync(path.join(root, "index.html"), "utf8");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

assert.match(page, /Facet Link Mint/);
assert.match(page, /publisherLinkUrl/);
assert.match(page, /No reader identifier/);
assert.match(page, /vendor\/qrcode\/qrcode\.js/);
assert.match(page, /qr-canvas\.js/);
assert.match(page, /FacetQr\.download/);
assert.doesNotMatch(page, /fetch\s*\(|sendBeacon|XMLHttpRequest/);
const qrSource = fs.readFileSync(path.join(root, "vendor", "qrcode", "qrcode.js"), "utf8");
assert.match(qrSource, /Copyright \(c\) 2009 Kazuhiko Arase/);
assert.match(qrSource, /Licensed under the MIT license/);
assert.match(calculator, /publisher_link_/);
assert.match(calculator, /params\.get\('via'\) === 'publisher'/);
assert.match(worker, /"\.\/link-mint\.html"/);

console.log("scriptless publisher link tests passed");
