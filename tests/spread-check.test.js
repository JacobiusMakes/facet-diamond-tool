"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.FacetCore = require("../core.js");
const spread = require("../spread-check-core.js");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "spread-check.html"), "utf8");
const browserCode = fs.readFileSync(path.join(root, "spread-check.js"), "utf8");
const reportLensCode = fs.readFileSync(path.join(root, "report-lens.js"), "utf8");

const baseline = spread.analyzeSpread("oval", 1, 8, 5.5);
assert.equal(Number(baseline.faceUpAreaDeltaPct.toFixed(6)), 0);

const larger = spread.analyzeSpread("oval", 1.5, 9.5, 6.4);
assert.ok(larger.faceUpAreaDeltaPct > 5);
assert.match(spread.spreadSummary(larger), /not a cut grade or quality verdict/);
assert.equal(spread.analyzeSpread("oval", 1.5, 0, 6.4), null);
assert.match(browserCode, /spread_check_match/);
assert.match(reportLensCode, /spread-check\.html/);
assert.match(reportLensCode, /report\.measurements\.length/);
assert.match(html, /not a cut grade/i);
assert.doesNotMatch(html + browserCode + spread.spreadSummary(larger), /[\u2013\u2014]/);

console.log("spread check tests passed");
