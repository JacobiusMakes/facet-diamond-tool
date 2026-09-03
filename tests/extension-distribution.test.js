const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const script = fs.readFileSync(path.join(root, "popup.js"), "utf8");
const config = require("../extension-channel.js");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8").replace(/^\uFEFF/, ""));

assert.equal(manifest.version, "0.5.0");
assert.equal(config.channel, "github");
assert.match(html, /extension-channel\.js/);
assert.doesNotMatch(html, /utm_content=extension_/);
assert.match(script, /distributionSurface\("match"\)/);
assert.match(script, /distributionSurface\("intent"\)/);
assert.match(script, /distributionSurface\("credit"\)/);
assert.match(script, /distributionSurface\("appointment"\)/);

console.log("extension distribution tests passed");
