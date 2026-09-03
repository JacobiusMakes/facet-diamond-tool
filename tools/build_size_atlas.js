"use strict";

const fs = require("fs");
const path = require("path");
const core = require("../core.js");

const root = path.resolve(__dirname, "..");
const imageDirectory = path.join(root, "assets", "size-atlas");
const catalogPath = path.join(root, "data", "size-atlas.json");
const sitemapPath = path.join(root, "image-sitemap.xml");
const publicRoot = "https://jacobiusmakes.github.io/facet-diamond-tool/";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stoneMarkup(shape, width, height, centerX, centerY) {
  const x = centerX - width / 2;
  const y = centerY - height / 2;
  if (shape === "round" || shape === "oval") {
    return `<ellipse cx="${centerX}" cy="${centerY}" rx="${(width / 2).toFixed(1)}" ry="${(height / 2).toFixed(1)}"/>`;
  }
  if (shape === "emerald") {
    const cut = Math.min(width, height) * 0.13;
    const points = [
      [x + cut, y], [x + width - cut, y], [x + width, y + cut],
      [x + width, y + height - cut], [x + width - cut, y + height],
      [x + cut, y + height], [x, y + height - cut], [x, y + cut],
    ];
    return `<polygon points="${points.map((point) => point.map((n) => n.toFixed(1)).join(",")).join(" ")}"/>`;
  }
  const shoulder = width * 0.2;
  return `<polygon points="${x.toFixed(1)},${centerY} ${(x + shoulder).toFixed(1)},${y.toFixed(1)} ${(x + width - shoulder).toFixed(1)},${y.toFixed(1)} ${(x + width).toFixed(1)},${centerY} ${(x + width - shoulder).toFixed(1)},${(y + height).toFixed(1)} ${(x + shoulder).toFixed(1)},${(y + height).toFixed(1)}"/>`;
}

function svgFor(row) {
  const maxStoneWidth = 400;
  const maxStoneHeight = 260;
  const scale = Math.min(maxStoneWidth / row.lengthMm, maxStoneHeight / row.widthMm);
  const stoneWidth = row.lengthMm * scale;
  const stoneHeight = row.widthMm * scale;
  const title = `${row.carat} carat ${row.label} diamond approximate face-up size`;
  const description = `${row.label}, ${row.carat} ct, approximately ${row.lengthMm.toFixed(2)} by ${row.widthMm.toFixed(2)} millimeters using the Facet typical-proportion model.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">${escapeXml(description)} Educational estimate. Exact grading-report measurements take precedence.</desc>
  <metadata>Creator: Stienhardt &amp; Stones. License: CC BY 4.0. Source: ${publicRoot}size-atlas.html</metadata>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdfa"/><stop offset="1" stop-color="#edf3f7"/></linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="0.45" stop-color="#dceaf4"/><stop offset="0.52" stop-color="#ffffff"/><stop offset="1" stop-color="#cbdde9"/></linearGradient>
  </defs>
  <rect width="1200" height="675" fill="#f8f5ef"/>
  <text x="72" y="72" fill="#2e624b" font-family="Verdana, sans-serif" font-size="15" letter-spacing="3">FACET OPEN SIZE ATLAS</text>
  <text x="72" y="150" fill="#091d2e" font-family="Georgia, serif" font-size="58">${escapeXml(row.carat)} ct ${escapeXml(row.label)}</text>
  <text x="72" y="202" fill="#334553" font-family="Georgia, serif" font-size="27">Approximate face-up size</text>
  <g fill="url(#stone)" stroke="#6f86a8" stroke-width="5">${stoneMarkup(row.shape, stoneWidth, stoneHeight, 850, 322)}</g>
  <line x1="${(850 - stoneWidth / 2).toFixed(1)}" y1="${(322 + stoneHeight / 2 + 35).toFixed(1)}" x2="${(850 + stoneWidth / 2).toFixed(1)}" y2="${(322 + stoneHeight / 2 + 35).toFixed(1)}" stroke="#173f70" stroke-width="2"/>
  <text x="850" y="${(322 + stoneHeight / 2 + 69).toFixed(1)}" fill="#173f70" text-anchor="middle" font-family="Verdana, sans-serif" font-size="18">${row.lengthMm.toFixed(2)} mm length</text>
  <text x="72" y="324" fill="#091d2e" font-family="Georgia, serif" font-size="48">${row.lengthMm.toFixed(2)} × ${row.widthMm.toFixed(2)} mm</text>
  <text x="72" y="378" fill="#6d675f" font-family="Verdana, sans-serif" font-size="17">Typical-proportion estimate, not a measurement of an individual stone.</text>
  <line x1="72" y1="538" x2="1128" y2="538" stroke="#d9d1c4"/>
  <text x="72" y="584" fill="#091d2e" font-family="Georgia, serif" font-size="25">Facet by Stienhardt &amp; Stones</text>
  <text x="72" y="620" fill="#6d675f" font-family="Verdana, sans-serif" font-size="15">CC BY 4.0 · ${publicRoot}size-atlas.html</text>
</svg>
`;
}

fs.mkdirSync(imageDirectory, { recursive: true });
const catalog = [];
for (const [shape, config] of Object.entries(core.SHAPES)) {
  for (let centicarats = 100; centicarats <= 300; centicarats += 10) {
    const carat = centicarats / 100;
    const size = core.faceUpSize(shape, carat);
    const slug = `${shape.replace(/_/g, "-")}-${carat.toFixed(2).replace(".", "-")}-carat-diamond-size.svg`;
    const row = {
      shape,
      label: config.label,
      carat: carat.toFixed(2),
      lengthMm: Number(size.lengthMm.toFixed(2)),
      widthMm: Number(size.widthMm.toFixed(2)),
      image: publicRoot + "assets/size-atlas/" + slug,
      download: "assets/size-atlas/" + slug,
      facetUrl: publicRoot + `?via=atlas&shape=${shape}&carat=${carat.toFixed(2)}`,
    };
    fs.writeFileSync(path.join(imageDirectory, slug), svgFor(row), "utf8");
    catalog.push(row);
  }
}

fs.writeFileSync(catalogPath, JSON.stringify({
  schemaVersion: 1,
  version: "1.0.0",
  published: "2026-09-03",
  name: "Facet Diamond Size Atlas",
  license: "https://creativecommons.org/licenses/by/4.0/",
  canonicalUrl: publicRoot + "size-atlas.html",
  images: catalog,
}, null, 2) + "\n", "utf8");

const imageEntries = catalog.map((row) => `  <url>
    <loc>${publicRoot}size-atlas.html?shape=${row.shape}&amp;carat=${row.carat}</loc>
    <image:image>
      <image:loc>${escapeXml(row.image)}</image:loc>
      <image:title>${escapeXml(row.carat + " carat " + row.label + " diamond approximate face-up size")}</image:title>
      <image:caption>${escapeXml(row.label + ", " + row.carat + " ct, approximately " + row.lengthMm.toFixed(2) + " by " + row.widthMm.toFixed(2) + " millimeters. Educational estimate.")}</image:caption>
      <image:license>https://creativecommons.org/licenses/by/4.0/</image:license>
    </image:image>
  </url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries}
</urlset>
`;
fs.writeFileSync(sitemapPath, sitemap, "utf8");
console.log("Facet Size Atlas: " + catalog.length + " SVG assets and image sitemap written");
