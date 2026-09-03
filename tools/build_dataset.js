"use strict";

const fs = require("fs");
const path = require("path");
const core = require("../core.js");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "data");
const jsonPath = path.join(outputDirectory, "face-up-size-reference.json");
const csvPath = path.join(outputDirectory, "face-up-size-reference.csv");

const rows = [];
for (const [shape, config] of Object.entries(core.SHAPES)) {
  for (let centicarats = 100; centicarats <= 300; centicarats += 10) {
    const carat = centicarats / 100;
    const result = core.faceUpSize(shape, carat);
    const facetUrl = new URL("https://jacobiusmakes.github.io/facet-diamond-tool/");
    facetUrl.searchParams.set("via", "data");
    facetUrl.searchParams.set("shape", shape);
    facetUrl.searchParams.set("carat", carat.toFixed(2));
    rows.push({
      shape_slug: shape,
      shape_label: config.label,
      carat_weight: Number(carat.toFixed(2)),
      approximate_length_mm: Number(result.lengthMm.toFixed(2)),
      approximate_width_mm: Number(result.widthMm.toFixed(2)),
      facet_url: facetUrl.toString(),
    });
  }
}

const dataset = {
  schemaVersion: 1,
  version: "1.0.0",
  published: "2026-09-03",
  name: "Facet Approximate Diamond Face-Up Size Reference",
  creator: "Stienhardt & Stones",
  contact: "jgalperin@stienhardt.com",
  license: "https://creativecommons.org/licenses/by/4.0/",
  canonicalUrl: "https://jacobiusmakes.github.io/facet-diamond-tool/dataset.html",
  method: "Cube-root scaling from one-carat face-up anchors: round 6.5 x 6.5 mm, oval 8.0 x 5.5 mm, emerald 7.0 x 5.0 mm, and Dutch Marquise 9.0 x 5.0 mm.",
  limitations: "Illustrative estimates based on typical proportions, not observations of individual diamonds. Always use the exact measurements on the grading report.",
  fields: [
    "shape_slug",
    "shape_label",
    "carat_weight",
    "approximate_length_mm",
    "approximate_width_mm",
    "facet_url",
  ],
  rows,
};

function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2) + "\n", "utf8");
const csv = [dataset.fields.join(",")]
  .concat(rows.map((row) => dataset.fields.map((field) => csvCell(row[field])).join(",")))
  .join("\n") + "\n";
fs.writeFileSync(csvPath, csv, "utf8");
console.log("Facet dataset: " + rows.length + " rows written to JSON and CSV");
