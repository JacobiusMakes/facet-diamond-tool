const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const files = ["README.md", "EMBED.md", "widget-demo.html"];
const publicCopy = files.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

assert.doesNotMatch(publicCopy, /@v0\.(?:1|2|3)\./);
assert.doesNotMatch(publicCopy, /wordpress-v0\.1\./);
assert.match(publicCopy, /facet-diamond-tool@v0\.4\.1\/facet-widget\.js/);
assert.match(publicCopy, /wordpress-v0\.2\.0/);

console.log("public release link tests passed");
