(function (root) {
  "use strict";

  const ANCHORS = Object.freeze({
    round: [6.5, 6.5],
    oval: [8.0, 5.5],
    emerald: [7.0, 5.0],
    dutch_marquise: [9.0, 5.0],
  });

  const SHAPES = Object.freeze({
    round: {
      label: "Round",
      collection: "/collections/round-cut-lab-grown-diamonds",
      terms: ["round brilliant", "round"],
    },
    oval: {
      label: "Oval",
      collection: "/collections/oval-cut-lab-grown-diamonds",
      terms: ["oval brilliant", "oval"],
    },
    emerald: {
      label: "Emerald",
      collection: "/collections/emerald-cut-lab-grown-diamonds",
      terms: ["emerald cut", "emerald"],
    },
    dutch_marquise: {
      label: "Dutch Marquise",
      collection: "/collections/dutch-marquise-lab-grown-diamonds",
      terms: ["hexagonal modified brilliant", "dutch marquise", "elongated hexagon"],
    },
  });

  function clampCarat(value) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return null;
    return Math.max(0.1, Math.min(20, parsed));
  }

  function normalizeShape(value) {
    const clean = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (ANCHORS[clean]) return clean;
    for (const [key, config] of Object.entries(SHAPES)) {
      if (config.terms.some((term) => clean === term.replace(/[\s-]+/g, "_"))) return key;
    }
    return null;
  }

  function faceUpSize(shape, carat) {
    const key = normalizeShape(shape);
    const weight = clampCarat(carat);
    if (!key || weight === null) return null;
    const scale = Math.cbrt(weight);
    const [length, width] = ANCHORS[key];
    return {
      shape: key,
      carat: weight,
      lengthMm: length * scale,
      widthMm: width * scale,
    };
  }

  function nearestShape(text, center, radius) {
    const start = Math.max(0, center - radius);
    const end = Math.min(text.length, center + radius);
    const windowText = text.slice(start, end).toLowerCase();
    let best = null;
    for (const [key, config] of Object.entries(SHAPES)) {
      for (const term of config.terms) {
        let index = windowText.indexOf(term);
        while (index !== -1) {
          const absoluteIndex = start + index;
          const distance = Math.abs(absoluteIndex - center);
          if (!best || distance < best.distance || (distance === best.distance && term.length > best.term.length)) {
            best = { key, term, distance };
          }
          index = windowText.indexOf(term, index + term.length);
        }
      }
    }
    return best;
  }

  function parseListing(text) {
    const clean = String(text || "").slice(0, 250000);
    const caratPattern = /(\d{1,2}(?:\.\d{1,3})?)\s*(?:ct\b|cts\b|carat\b|carats\b|-carat\b)/gi;
    const candidates = [];
    let match;
    while ((match = caratPattern.exec(clean)) && candidates.length < 40) {
      const carat = clampCarat(match[1]);
      if (carat === null) continue;
      const nearbyShape = nearestShape(clean, match.index, 180);
      candidates.push({
        carat,
        shape: nearbyShape ? nearbyShape.key : null,
        shapeTerm: nearbyShape ? nearbyShape.term : null,
        confidence: nearbyShape ? "shape_and_carat" : "carat_only",
        distance: nearbyShape ? nearbyShape.distance : Number.MAX_SAFE_INTEGER,
      });
    }
    candidates.sort((a, b) => {
      if (a.shape && !b.shape) return -1;
      if (!a.shape && b.shape) return 1;
      return a.distance - b.distance;
    });
    return candidates[0] || null;
  }

  function trackedCollectionUrl(options) {
    const shape = normalizeShape(options && options.shape);
    const carat = clampCarat(options && options.carat);
    if (!shape || carat === null) return null;
    const content = String((options && options.content) || "web_match").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const url = new URL("https://stienhardt.com" + SHAPES[shape].collection);
    url.searchParams.set("utm_source", "facet");
    url.searchParams.set("utm_medium", "shopping_tool");
    url.searchParams.set("utm_campaign", "diamond_size_check");
    url.searchParams.set("utm_content", content);
    url.searchParams.set("utm_term", shape + "_" + carat.toFixed(2).replace(".", "_") + "ct");
    url.searchParams.set("facet_shape", shape);
    url.searchParams.set("facet_carat", carat.toFixed(2));
    return url.toString();
  }

  function comparisonBrief(shape, carat) {
    const result = faceUpSize(shape, carat);
    if (!result) return "";
    const label = SHAPES[result.shape].label;
    return [
      "Diamond comparison brief",
      "Shape: " + label,
      "Carat weight: " + result.carat.toFixed(2) + " ct",
      "Typical face-up size: " + result.lengthMm.toFixed(1) + " x " + result.widthMm.toFixed(1) + " mm",
      "Confirm on the grading report: exact measurements, report number, and girdle inscription.",
      "Size estimate uses typical proportions. The exact stone may differ.",
    ].join("\n");
  }

  function sanitizeSurface(value, fallback) {
    const clean = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);
    return clean || fallback || "web_match";
  }

  function extensionChannel(value) {
    const clean = String(value || "").trim().toLowerCase();
    return ["github", "chrome", "edge", "firefox"].includes(clean) ? clean : "github";
  }

  function sanitizePublisher(value) {
    const clean = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48);
    return clean || "publisher";
  }

  function publisherLinkUrl(options) {
    const publisher = sanitizePublisher(options && options.publisher);
    const shape = normalizeShape(options && options.shape) || "oval";
    const carat = clampCarat(options && options.carat) || 1.5;
    const url = new URL("https://jacobiusmakes.github.io/facet-diamond-tool/");
    url.searchParams.set("via", "publisher");
    url.searchParams.set("partner", publisher);
    url.searchParams.set("shape", shape);
    url.searchParams.set("carat", carat.toFixed(2));
    return url.toString();
  }

  function extensionSurface(channel, action) {
    const cleanAction = sanitizeSurface(action, "match");
    return "extension_" + extensionChannel(channel) + "_" + cleanAction;
  }

  function trackedPageUrl(path, content) {
    let url = new URL(String(path || "/"), "https://stienhardt.com");
    if (url.origin !== "https://stienhardt.com") url = new URL("https://stienhardt.com/");
    url.search = "";
    url.hash = "";
    url.searchParams.set("utm_source", "facet");
    url.searchParams.set("utm_medium", "shopping_tool");
    url.searchParams.set("utm_campaign", "diamond_size_check");
    url.searchParams.set("utm_content", sanitizeSurface(content, "extension_github_credit"));
    return url.toString();
  }

  function intentCode(shape, carat, entropy) {
    const key = normalizeShape(shape);
    const weight = clampCarat(carat);
    if (!key || weight === null) return null;
    const prefixes = {
      round: "RD",
      oval: "OV",
      emerald: "EM",
      dutch_marquise: "DM",
    };
    const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    let seed = String(entropy || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!seed) {
      const bytes = new Uint8Array(5);
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
      } else {
        for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
      }
      seed = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
    }
    seed = seed.slice(0, 5).padEnd(5, "X");
    const centicarats = String(Math.round(weight * 100)).padStart(3, "0");
    return "FC-" + prefixes[key] + "-" + centicarats + "-" + seed;
  }

  function intentEmailUrl(options) {
    const shape = normalizeShape(options && options.shape);
    const carat = clampCarat(options && options.carat);
    if (!shape || carat === null) return null;
    const surface = sanitizeSurface(options && options.surface, "web_match");
    const code = String((options && options.code) || intentCode(shape, carat)).replace(/[^A-Z0-9-]/gi, "").slice(0, 32);
    const result = faceUpSize(shape, carat);
    const suppliedMeasurements = options && options.measurements;
    const measurements = suppliedMeasurements && Number.isFinite(Number(suppliedMeasurements.length)) && Number.isFinite(Number(suppliedMeasurements.width))
      ? Number(suppliedMeasurements.length).toFixed(2) + " x " + Number(suppliedMeasurements.width).toFixed(2) + " mm (grading report)"
      : result.lengthMm.toFixed(1) + " x " + result.widthMm.toFixed(1) + " mm (typical estimate)";
    const details = options && options.details ? String(options.details).slice(0, 1200) : "";
    const body = [
      "Hi Jacob,",
      "",
      "I used Facet and would like help finding or evaluating a diamond with these specifications:",
      "",
      "Intent code: " + code,
      "Source: " + surface,
      "Shape: " + SHAPES[shape].label,
      "Carat weight: " + carat.toFixed(2) + " ct",
      "Measurements: " + measurements,
      details ? "Other report details: " + details : "",
      "",
      "Please tell me what else you need. I understand Facet is educational and not an appraisal.",
    ].filter(Boolean).join("\n");
    const subject = "Facet diamond request " + code;
    return "mailto:jgalperin@stienhardt.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  const api = Object.freeze({
    ANCHORS,
    SHAPES,
    clampCarat,
    normalizeShape,
    faceUpSize,
    parseListing,
    trackedCollectionUrl,
    comparisonBrief,
    sanitizeSurface,
    sanitizePublisher,
    publisherLinkUrl,
    extensionChannel,
    extensionSurface,
    trackedPageUrl,
    intentCode,
    intentEmailUrl,
  });

  root.FacetCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
