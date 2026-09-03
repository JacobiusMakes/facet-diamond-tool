const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const plugin = path.join(root, "integrations", "wordpress", "facet-diamond-size");
const php = fs.readFileSync(path.join(plugin, "facet-diamond-size.php"), "utf8");
const readme = fs.readFileSync(path.join(plugin, "README.txt"), "utf8");
const bundled = fs.readFileSync(path.join(plugin, "assets", "facet-widget.js"), "utf8");
const source = fs.readFileSync(path.join(root, "facet-widget.js"), "utf8");

assert.match(php, /Version:\s*0\.2\.0/);
assert.match(readme, /Stable tag:\s*0\.2\.0/);
assert.match(readme, /Tested up to:\s*7\.1/);
assert.match(php, /plugins_url\('assets\/facet-widget\.js', __FILE__\)/);
assert.doesNotMatch(php, /cdn\.jsdelivr\.net|esm\.sh/);
assert.match(php, /'commerce'\s*=>\s*'off'/);
assert.equal(bundled, source, "bundled WordPress asset must match the released component");
assert.doesNotMatch(bundled, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/);

console.log("wordpress package tests passed");
