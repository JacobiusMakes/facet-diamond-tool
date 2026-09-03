const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "attribution-registry.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

assert.equal(registry.source, "facet");
assert.equal(registry.medium, "shopping_tool");
assert.equal(registry.campaign, "diamond_size_check");
assert.ok(registry.surfaces.report_lens_match);
assert.ok(registry.surfaces.report_lens_intent);
assert.ok(registry.surfaces.share_target_match);
assert.ok(registry.surfaces.pasted_listing_match);
for (const channel of ["github", "chrome", "edge", "firefox"]) {
  for (const action of ["match", "intent", "credit", "appointment"]) {
    assert.ok(registry.surfaces[`extension_${channel}_${action}`]);
  }
}
assert.ok(registry.prohibitedAnalyticsFields.includes("report_number"));
assert.ok(registry.prohibitedAnalyticsFields.includes("listing_url"));
assert.ok(registry.surfaces["publisher_link_<publisher_slug>"]);

assert.equal(manifest.share_target.method, "POST");
assert.equal(manifest.share_target.enctype, "multipart/form-data");
assert.equal(manifest.share_target.action, "./share-target");
assert.match(worker, /endsWith\("\/share-target"\)/);
assert.match(worker, /target\.searchParams\.set\("shape"/);
assert.doesNotMatch(worker, /target\.searchParams\.set\("url"/);

console.log("Facet attribution registry tests passed");
