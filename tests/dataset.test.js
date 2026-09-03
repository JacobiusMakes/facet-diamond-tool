"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "face-up-size-reference.json"), "utf8"));
const csv = fs.readFileSync(path.join(root, "data", "face-up-size-reference.csv"), "utf8");
const html = fs.readFileSync(path.join(root, "dataset.html"), "utf8");
const citation = fs.readFileSync(path.join(root, "CITATION.cff"), "utf8");

assert.equal(data.version, "1.0.0");
assert.equal(data.rows.length, 84);
assert.equal(new Set(data.rows.map((row) => row.shape_slug)).size, 4);
assert.equal(data.rows.filter((row) => row.shape_slug === "oval").length, 21);
const ovalOne = data.rows.find((row) => row.shape_slug === "oval" && row.carat_weight === 1);
assert.equal(ovalOne.approximate_length_mm, 8);
assert.equal(ovalOne.approximate_width_mm, 5.5);
assert.match(ovalOne.facet_url, /via=data/);
assert.match(csv, /^shape_slug,shape_label,carat_weight/);
assert.match(html, /"@type":"Dataset"/);
assert.match(html, /CC BY 4\.0/);
assert.match(citation, /type: dataset/);
assert.doesNotMatch(JSON.stringify(data) + csv + html + citation, /[\u2013\u2014]/);

console.log("dataset tests passed");
