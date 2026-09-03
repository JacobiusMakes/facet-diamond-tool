const assert = require("node:assert/strict");
const lens = require("../report-lens-core.js");

const igi = lens.parseReportText(`
  INTERNATIONAL GEMOLOGICAL INSTITUTE
  Report Number LG 647412345
  Report Date August 21, 2026
  Shape and Cutting Style Oval Brilliant
  Measurements 10.21 x 7.02 x 4.31 mm
  Carat Weight 2.04 Carats
  Color Grade F
  Clarity Grade VS1
  Polish Excellent
  Symmetry Very Good
  Fluorescence None
  Total Depth 61.4%
  Table 58%
`);

assert.equal(igi.lab, "IGI");
assert.equal(igi.reportNumber, "LG647412345");
assert.equal(igi.shape, "oval");
assert.equal(igi.carat, 2.04);
assert.deepEqual(
  { length: igi.measurements.length, width: igi.measurements.width, depth: igi.measurements.depth },
  { length: 10.21, width: 7.02, depth: 4.31 }
);
assert.equal(igi.ratio, 1.45);
assert.equal(igi.color, "F");
assert.equal(igi.clarity, "VS1");
assert.equal(igi.depthPct, 61.4);
assert.equal(igi.tablePct, 58);
assert.equal(igi.confidence, "strong");
assert.equal(igi.commerceShape, "oval");
assert.match(lens.reportEmailDetails(igi), /Color: F/);

const gia = lens.parseReportText(`
  GIA LABORATORY-GROWN DIAMOND REPORT
  GIA Report Number 1234567890
  January 15, 2026
  Round Brilliant
  7.40 x 7.38 x 4.50 mm
  1.50 carat
  Color Grade G
  Clarity Grade VVS2
  Polish EXCELLENT
  Symmetry EXCELLENT
  Fluorescence FAINT
`);

assert.equal(gia.lab, "GIA");
assert.equal(gia.shape, "round");
assert.equal(gia.carat, 1.5);
assert.equal(gia.measurements.display, "7.40 x 7.38 x 4.50 mm");
assert.equal(gia.confidence, "strong");

const unsupported = lens.parseReportText("IGI Report Number LG123456789 Pear Brilliant 1.75 ct Measurements 10.60 x 6.50 x 4.00 mm");
assert.equal(unsupported.shape, "pear");
assert.equal(unsupported.commerceShape, null);

const empty = lens.parseReportText("This image has no extractable report text.");
assert.equal(empty.confidence, "insufficient");
assert.equal(empty.reportNumber, null);

console.log("Report Lens core tests passed");
