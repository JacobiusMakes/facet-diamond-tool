(function (root) {
  "use strict";

  function draw(canvas, text, options) {
    if (!canvas || !root.qrcode) return false;
    const settings = options || {};
    const code = root.qrcode(0, settings.errorCorrection || "M");
    code.addData(String(text || ""));
    code.make();
    const count = code.getModuleCount();
    const quiet = Number.isFinite(settings.quiet) ? settings.quiet : 4;
    const unit = Math.floor(canvas.width / (count + quiet * 2));
    const drawn = unit * (count + quiet * 2);
    const offsetX = Math.floor((canvas.width - drawn) / 2);
    const offsetY = Math.floor((canvas.height - drawn) / 2);
    const context = canvas.getContext("2d");
    context.fillStyle = settings.light || "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = settings.dark || "#091d2e";
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        if (code.isDark(row, column)) {
          context.fillRect(offsetX + (column + quiet) * unit, offsetY + (row + quiet) * unit, unit, unit);
        }
      }
    }
    return true;
  }

  function toBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async function download(canvas, filename) {
    const blob = await toBlob(canvas);
    if (!blob) return false;
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    return true;
  }

  const api = Object.freeze({ draw, toBlob, download });
  root.FacetQr = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
