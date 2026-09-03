(function () {
  "use strict";

  const shape = document.getElementById("shape");
  const carat = document.getElementById("carat");
  const length = document.getElementById("length");
  const width = document.getElementById("width");
  const delta = document.getElementById("delta");
  const interpretation = document.getElementById("interpretation");
  const reported = document.getElementById("reported");
  const expected = document.getElementById("expected");
  const match = document.getElementById("match");
  const status = document.getElementById("status");
  const params = new URLSearchParams(location.search);

  const startingShape = FacetCore.normalizeShape(params.get("shape"));
  if (startingShape) shape.value = startingShape;
  for (const [field, input] of [["carat", carat], ["length", length], ["width", width]]) {
    const value = Number.parseFloat(params.get(field));
    if (Number.isFinite(value) && value > 0) input.value = value.toFixed(2);
  }

  function render() {
    const result = FacetSpreadCheck.analyzeSpread(shape.value, carat.value, length.value, width.value);
    if (!result) {
      delta.textContent = "Check the inputs";
      interpretation.textContent = "Enter positive dimensions from the grading report.";
      match.removeAttribute("href");
      return;
    }
    const sign = result.faceUpAreaDeltaPct >= 0 ? "+" : "";
    delta.textContent = sign + result.faceUpAreaDeltaPct.toFixed(1) + "%";
    interpretation.textContent = (result.faceUpAreaDeltaPct >= 0 ? "larger" : "smaller") + " face-up plan-area proxy than the typical estimate";
    reported.textContent = result.reportedLengthMm.toFixed(2) + " x " + result.reportedWidthMm.toFixed(2) + " mm";
    expected.textContent = result.expectedLengthMm.toFixed(2) + " x " + result.expectedWidthMm.toFixed(2) + " mm";
    match.href = FacetCore.trackedCollectionUrl({ shape: result.shape, carat: result.carat, content: "spread_check_match" });
    match.textContent = "Browse " + FacetCore.SHAPES[result.shape].label + " diamonds";
  }

  [shape, carat, length, width].forEach((input) => input.addEventListener("input", render));
  document.getElementById("copy").addEventListener("click", async () => {
    const result = FacetSpreadCheck.analyzeSpread(shape.value, carat.value, length.value, width.value);
    try {
      await navigator.clipboard.writeText(FacetSpreadCheck.spreadSummary(result));
      status.textContent = "Spread check copied.";
    } catch (error) {
      status.textContent = "Copy was blocked by the browser.";
    }
  });
  render();
})();
