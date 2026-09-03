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
assert.match(calculator, /publisher_link_/);
assert.match(calculator, /params\.get\('via'\) === 'publisher'/);
assert.match(worker, /"\.\/link-mint\.html"/);

console.log("scriptless publisher link tests passed");
