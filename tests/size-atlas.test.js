"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "size-atlas.json"), "utf8"));
const sitemap = fs.readFileSync(path.join(root, "image-sitemap.xml"), "utf8");
const html = fs.readFileSync(path.join(root, "size-atlas.html"), "utf8");

assert.equal(catalog.images.length, 84);
assert.equal(new Set(catalog.images.map((row) => row.image)).size, 84);
assert.equal(fs.readdirSync(path.join(root, "assets", "size-atlas")).filter((name) => name.endsWith(".svg")).length, 84);
const oval = catalog.images.find((row) => row.shape === "oval" && row.carat === "1.50");
assert.equal(oval.lengthMm, 9.16);
assert.equal(oval.widthMm, 6.3);
assert.match(oval.facetUrl, /via=atlas/);
const svg = fs.readFileSync(path.join(root, oval.download), "utf8");
assert.match(svg, /<title id="title">1\.50 carat Oval diamond approximate face-up size<\/title>/);
assert.match(svg, /CC BY 4\.0/);
assert.match(sitemap, /xmlns:image=/);
assert.equal((sitemap.match(/<image:image>/g) || []).length, 84);
assert.match(html, /not true-size on a screen/);
assert.doesNotMatch(JSON.stringify(catalog) + sitemap + html + svg, /[\u2013\u2014]/);

console.log("size atlas tests passed");
