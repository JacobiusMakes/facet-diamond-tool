(function (root) {
  "use strict";

  const SHAPE_TERMS = Object.freeze({
    dutch_marquise: ["hexagonal modified brilliant", "dutch marquise", "elongated hexagon"],
    emerald: ["emerald cut", "emerald"],
    oval: ["oval brilliant", "oval"],
    round: ["round brilliant", "round"],
  });

  function compact(value) {
    return String(value || "").trim();
  }

  function normalizeLab(value) {
    const clean = compact(value).toUpperCase().replace(/[^A-Z]/g, "");
    if (clean.includes("GIA")) return "GIA";
    if (clean.includes("IGI")) return "IGI";
    if (clean.includes("GCAL")) return "GCAL";
    return clean ? "OTHER" : "";
  }

  function normalizeReportNumber(value) {
    return compact(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function parseShapeAndCarat(text) {
    const clean = String(text || "").slice(0, 250000);
    if (root.FacetCore && root.FacetCore.parseListing) return root.FacetCore.parseListing(clean);
    const lower = clean.toLowerCase();
    const caratMatch = lower.match(/(\d{1,2}(?:\.\d{1,3})?)\s*(?:ct\b|cts\b|carat\b|carats\b|-carat\b)/i);
    let shape = null;
    for (const [key, terms] of Object.entries(SHAPE_TERMS)) {
      if (terms.some((term) => lower.includes(term))) {
        shape = key;
        break;
      }
    }
    return caratMatch ? { shape, carat: Number.parseFloat(caratMatch[1]) } : null;
  }

  function parseDimensions(text) {
    const clean = String(text || "").slice(0, 250000);
    const match = clean.match(/(\d{1,2}(?:\.\d{1,3})?)\s*[x×]\s*(\d{1,2}(?:\.\d{1,3})?)(?:\s*[x×]\s*(\d{1,2}(?:\.\d{1,3})?))?\s*mm\b/i);
    if (!match) return { length: null, width: null, depth: null };
    const first = Number.parseFloat(match[1]);
    const second = Number.parseFloat(match[2]);
    return {
      length: Math.max(first, second),
      width: Math.min(first, second),
      depth: match[3] ? Number.parseFloat(match[3]) : null,
    };
  }

  function parsePrice(text) {
    const clean = String(text || "").slice(0, 250000);
    const matches = [...clean.matchAll(/\$\s*((?:[1-9]\d{0,2}(?:,\d{3})+|[1-9]\d{2,6})(?:\.\d{2})?)/g)];
    if (!matches.length) return null;
    const candidates = matches.map((match) => ({
      price: Number.parseFloat(match[1].replace(/,/g, "")),
      context: clean.slice(Math.max(0, match.index - 50), match.index + 15).toLowerCase(),
    })).filter((candidate) => Number.isFinite(candidate.price));
    candidates.sort((a, b) => {
      const aScore = /price|sale|today|usd/.test(a.context) ? 0 : 1;
      const bScore = /price|sale|today|usd/.test(b.context) ? 0 : 1;
      return aScore - bScore;
    });
    return candidates[0] ? candidates[0].price : null;
  }

  function parseReportNumber(text) {
    const clean = String(text || "").slice(0, 250000);
    const patterns = [
      /(?:report|certificate|certification|grading report)\s*(?:number|no\.?|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9 -]{5,28})/i,
      /(?:GIA|IGI|GCAL)\s*(?:report|certificate|cert)?\s*(?:number|no\.?|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9 -]{5,28})/i,
    ];
    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match && /\d{6}/.test(normalizeReportNumber(match[1]))) return match[1];
    }
    return "";
  }

  function parseListingDetails(text) {
    const clean = String(text || "").slice(0, 250000);
    const shapeAndCarat = parseShapeAndCarat(clean) || {};
    const dimensions = parseDimensions(clean);
    const labMatch = clean.match(/\b(GIA|IGI|GCAL)\b/i);
    return {
      shape: shapeAndCarat.shape || "",
      carat: Number.isFinite(shapeAndCarat.carat) ? shapeAndCarat.carat : null,
      length: dimensions.length,
      width: dimensions.width,
      depth: dimensions.depth,
      lab: labMatch ? labMatch[1].toUpperCase() : "",
      reportNumber: parseReportNumber(clean),
      price: parsePrice(clean),
    };
  }

  function numeric(value, digits) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed.toFixed(digits) : "";
  }

  function certificateKey(candidate) {
    const lab = normalizeLab(candidate.lab);
    const report = normalizeReportNumber(candidate.reportNumber);
    return lab && report ? `cert:${lab}:${report}` : "";
  }

  function measurementKey(candidate) {
    const shape = compact(candidate.shape).toLowerCase().replace(/[\s-]+/g, "_");
    const carat = numeric(candidate.carat, 3);
    const length = numeric(candidate.length, 2);
    const width = numeric(candidate.width, 2);
    const depth = numeric(candidate.depth, 2);
    return shape && carat && length && width && depth
      ? `measure:${shape}:${carat}:${length}:${width}:${depth}`
      : "";
  }

  function spreadFor(candidates) {
    const prices = candidates.map((candidate) => Number.parseFloat(candidate.price)).filter((price) => Number.isFinite(price) && price > 0);
    if (prices.length < 2) return null;
    const minimum = Math.min(...prices);
    const maximum = Math.max(...prices);
    return {
      minimum,
      maximum,
      difference: maximum - minimum,
      percent: minimum ? (maximum - minimum) / minimum : null,
    };
  }

  function collectGroups(candidates, keyBuilder, kind) {
    const buckets = new Map();
    for (const candidate of candidates) {
      const key = keyBuilder(candidate);
      if (!key) continue;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(candidate);
    }
    return [...buckets.entries()]
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => ({ kind, key, ids: items.map((item) => item.id), spread: spreadFor(items) }));
  }

  function duplicateGroups(candidates) {
    const safe = Array.isArray(candidates) ? candidates : [];
    const exact = collectGroups(safe, certificateKey, "exact_certificate");
    const exactSets = new Set(exact.map((group) => [...group.ids].sort().join("|")));
    const possible = collectGroups(safe, measurementKey, "possible_measurement")
      .filter((group) => !exactSets.has([...group.ids].sort().join("|")));
    return [...exact, ...possible];
  }

  function matchFor(candidateId, groups) {
    const matches = (groups || []).filter((group) => group.ids.includes(candidateId));
    return matches.find((group) => group.kind === "exact_certificate") || matches[0] || null;
  }

  function vaultSummary(candidates, groups) {
    const safe = Array.isArray(candidates) ? candidates : [];
    const sellers = new Set(safe.map((candidate) => compact(candidate.seller).toLowerCase()).filter(Boolean));
    const spreads = (groups || []).map((group) => group.spread && group.spread.difference).filter((value) => Number.isFinite(value));
    return {
      candidates: safe.length,
      sellers: sellers.size,
      exactGroups: (groups || []).filter((group) => group.kind === "exact_certificate").length,
      possibleGroups: (groups || []).filter((group) => group.kind === "possible_measurement").length,
      largestSpread: spreads.length ? Math.max(...spreads) : 0,
    };
  }

  function csvValue(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
  }

  function toCsv(candidates) {
    const fields = ["seller", "listingUrl", "lab", "reportNumber", "shape", "carat", "length", "width", "depth", "price", "notes"];
    const rows = [fields.map(csvValue).join(",")];
    for (const candidate of candidates || []) rows.push(fields.map((field) => csvValue(candidate[field])).join(","));
    return rows.join("\r\n");
  }

  const api = Object.freeze({
    normalizeLab,
    normalizeReportNumber,
    parseDimensions,
    parsePrice,
    parseReportNumber,
    parseListingDetails,
    certificateKey,
    measurementKey,
    spreadFor,
    duplicateGroups,
    matchFor,
    vaultSummary,
    toCsv,
  });

  root.SameStoneCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
