const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const tools = JSON.parse(fs.readFileSync(path.join(root, "tools.json"), "utf8"));
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
const reportLens = fs.readFileSync(path.join(root, "report-lens.html"), "utf8");

assert.equal(tools.name, "Facet");
assert.equal(tools.privacy.processing, "local_by_default");
assert.deepEqual(tools.privacy.collected, []);
assert.equal(tools.tools.length, 8);
for (const tool of tools.tools) {
  assert.match(tool.url, /^https:\/\//);
  assert.ok(tool.inputs.length > 0);
  assert.ok(tool.outputs.length > 0);
  assert.ok(tool.surface);
}
assert.match(robots, /Allow: \//);
assert.match(robots, /Sitemap: https:\/\/jacobiusmakes\.github\.io\/facet-diamond-tool\/sitemap\.xml/);
assert.match(llms, /## Privacy boundary/);
assert.doesNotMatch(llms, /—/);
assert.match(reportLens, /"@type":"WebApplication"/);
assert.match(reportLens, /"name":"Report Lens by Facet"/);

console.log("machine-readable discovery tests passed");
