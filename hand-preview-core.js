(function (root) {
  "use strict";

  const CARD_LONG_EDGE_MM = 85.6;

  function pointDistance(first, second) {
    if (!first || !second) return null;
    const dx = Number(second.x) - Number(first.x);
    const dy = Number(second.y) - Number(first.y);
    const distance = Math.hypot(dx, dy);
    return Number.isFinite(distance) ? distance : null;
  }

  function pixelsPerMillimeter(first, second) {
    const distance = pointDistance(first, second);
    if (!distance || distance < 20) return null;
    return distance / CARD_LONG_EDGE_MM;
  }

  function overlaySize(shape, carat, pixelsPerMm) {
    const scale = Number(pixelsPerMm);
    if (!Number.isFinite(scale) || scale <= 0 || !root.FacetCore) return null;
    const size = root.FacetCore.faceUpSize(shape, carat);
    if (!size) return null;
    return {
      shape: size.shape,
      carat: size.carat,
      lengthMm: size.lengthMm,
      widthMm: size.widthMm,
      lengthPx: size.lengthMm * scale,
      widthPx: size.widthMm * scale,
    };
  }

  function fitInside(width, height, maximumWidth, maximumHeight) {
    const sourceWidth = Number(width);
    const sourceHeight = Number(height);
    if (![sourceWidth, sourceHeight, maximumWidth, maximumHeight].every((value) => Number.isFinite(Number(value)) && Number(value) > 0)) return null;
    const scale = Math.min(Number(maximumWidth) / sourceWidth, Number(maximumHeight) / sourceHeight, 1);
    return {
      width: Math.round(sourceWidth * scale),
      height: Math.round(sourceHeight * scale),
      scale,
    };
  }

  function shapePoints(kind, length, width) {
    const halfLength = length / 2;
    const halfWidth = width / 2;
    if (kind === "emerald") {
      const bevel = Math.min(length, width) * 0.17;
      return [
        [-halfLength + bevel, -halfWidth], [halfLength - bevel, -halfWidth],
        [halfLength, -halfWidth + bevel], [halfLength, halfWidth - bevel],
        [halfLength - bevel, halfWidth], [-halfLength + bevel, halfWidth],
        [-halfLength, halfWidth - bevel], [-halfLength, -halfWidth + bevel],
      ];
    }
    if (kind === "dutch_marquise") {
      const shoulder = length * 0.22;
      return [
        [-halfLength, 0], [-halfLength + shoulder, -halfWidth],
        [halfLength - shoulder, -halfWidth], [halfLength, 0],
        [halfLength - shoulder, halfWidth], [-halfLength + shoulder, halfWidth],
      ];
    }
    return [];
  }

  const api = Object.freeze({
    CARD_LONG_EDGE_MM,
    pointDistance,
    pixelsPerMillimeter,
    overlaySize,
    fitInside,
    shapePoints,
  });

  root.HandPreviewCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
