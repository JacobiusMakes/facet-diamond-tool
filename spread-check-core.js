(function (root) {
  "use strict";

  function analyzeSpread(shape, carat, lengthMm, widthMm) {
    if (!root.FacetCore) return null;
    const expected = root.FacetCore.faceUpSize(shape, carat);
    const length = Number.parseFloat(lengthMm);
    const width = Number.parseFloat(widthMm);
    if (!expected || !Number.isFinite(length) || !Number.isFinite(width)) return null;
    if (length <= 0 || width <= 0 || length > 40 || width > 40) return null;
    const expectedAreaProxy = expected.lengthMm * expected.widthMm;
    const reportedAreaProxy = length * width;
    return {
      shape: expected.shape,
      carat: expected.carat,
      reportedLengthMm: length,
      reportedWidthMm: width,
      expectedLengthMm: expected.lengthMm,
      expectedWidthMm: expected.widthMm,
      lengthDeltaPct: 100 * (length / expected.lengthMm - 1),
      widthDeltaPct: 100 * (width / expected.widthMm - 1),
      faceUpAreaDeltaPct: 100 * (reportedAreaProxy / expectedAreaProxy - 1),
    };
  }

  function spreadSummary(result) {
    if (!result) return "";
    const value = Math.abs(result.faceUpAreaDeltaPct).toFixed(1);
    const direction = result.faceUpAreaDeltaPct >= 0 ? "larger" : "smaller";
    return [
      "Facet spread check",
      "Reported face-up dimensions: " + result.reportedLengthMm.toFixed(2) + " x " + result.reportedWidthMm.toFixed(2) + " mm",
      "Typical-proportion estimate: " + result.expectedLengthMm.toFixed(2) + " x " + result.expectedWidthMm.toFixed(2) + " mm",
      "Reported plan-area proxy: " + value + "% " + direction + " than the estimate",
      "This comparison is not a cut grade or quality verdict. Confirm all proportions on the grading report.",
    ].join("\n");
  }

  const api = Object.freeze({ analyzeSpread, spreadSummary });
  root.FacetSpreadCheck = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
