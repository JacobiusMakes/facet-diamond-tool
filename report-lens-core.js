(function (root) {
  "use strict";

  const LABS = Object.freeze({
    IGI: {
      label: "IGI",
      verifyUrl: "https://www.igi.org/verify-your-report/",
    },
    GIA: {
      label: "GIA",
      verifyUrl: "https://www.gia.edu/report-check",
    },
    GCAL: {
      label: "GCAL",
      verifyUrl: "https://www.gcalusa.com/certificate-search.html",
    },
  });

  const SHAPE_PATTERNS = Object.freeze([
    ["dutch_marquise", /\b(?:dutch\s+marquise|hexagonal\s+modified\s+brilliant|elongated\s+hexagon)\b/i, "Dutch Marquise"],
    ["round", /\bround(?:\s+brilliant)?\b/i, "Round"],
    ["oval", /\boval(?:\s+(?:brilliant|modified\s+brilliant))?\b/i, "Oval"],
    ["emerald", /\bemerald(?:\s+cut)?\b/i, "Emerald"],
    ["pear", /\bpear(?:\s+(?:brilliant|modified\s+brilliant))?\b/i, "Pear"],
    ["marquise", /\bmarquise(?:\s+(?:brilliant|modified\s+brilliant))?\b/i, "Marquise"],
    ["cushion", /\bcushion(?:\s+(?:brilliant|modified\s+brilliant))?\b/i, "Cushion"],
    ["radiant", /\b(?:radiant|cut-cornered\s+rectangular\s+modified\s+brilliant)\b/i, "Radiant"],
    ["princess", /\bprincess(?:\s+cut)?\b/i, "Princess"],
    ["asscher", /\basscher(?:\s+cut)?\b/i, "Asscher"],
    ["heart", /\bheart(?:\s+brilliant)?\b/i, "Heart"],
  ]);

  function cleanText(value) {
    return String(value || "")
      .replace(/[\u00a0\u2007\u202f]/g, " ")
      .replace(/[×✕]/g, "x")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500000);
  }

  function capture(text, patterns, group) {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) return String(match[group || 1] || "").trim();
    }
    return null;
  }

  function number(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number.parseFloat(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function detectLab(text) {
    if (/\binternational\s+gemological\s+institute\b|\bIGI\b/i.test(text)) return "IGI";
    if (/\bgemological\s+institute\s+of\s+america\b|\bGIA\b/i.test(text)) return "GIA";
    if (/\bgem\s+certification\s+and\s+assurance\s+lab\b|\bGCAL\b/i.test(text)) return "GCAL";
    return null;
  }

  function detectShape(text) {
    const shapeSection = capture(text, [
      /(?:shape\s+and\s+cutting\s+style|shape\s+and\s+cut|shape|cutting\s+style)\s*[:#-]?\s*([^|]{2,80})/i,
    ]);
    const candidates = [shapeSection, text].filter(Boolean);
    for (const candidate of candidates) {
      for (const [key, pattern, label] of SHAPE_PATTERNS) {
        if (pattern.test(candidate)) return { key, label };
      }
    }
    return { key: null, label: null };
  }

  function parseMeasurements(text) {
    const raw = capture(text, [
      /measurements?\s*[:#-]?\s*(\d{1,2}(?:\.\d{1,3})?\s*x\s*\d{1,2}(?:\.\d{1,3})?(?:\s*x\s*\d{1,2}(?:\.\d{1,3})?)?\s*mm)/i,
      /\b(\d{1,2}(?:\.\d{1,3})?\s*x\s*\d{1,2}(?:\.\d{1,3})?\s*x\s*\d{1,2}(?:\.\d{1,3})?\s*mm)\b/i,
    ]);
    if (!raw) return null;
    const values = raw.match(/\d{1,2}(?:\.\d{1,3})?/g) || [];
    if (values.length < 2) return null;
    return {
      length: number(values[0]),
      width: number(values[1]),
      depth: values[2] ? number(values[2]) : null,
      display: values.map((value) => number(value).toFixed(2)).join(" x ") + " mm",
    };
  }

  function labeledValue(text, label, allowed) {
    const expression = new RegExp("(?:" + label + ")\\s*[:#-]?\\s*(" + allowed + ")", "i");
    return capture(text, [expression]);
  }

  function parseReportText(value) {
    const text = cleanText(value);
    const lab = detectLab(text);
    const shape = detectShape(text);
    const reportNumber = capture(text, [
      /(?:report|certificate)\s*(?:number|no\.?|#)\s*[:#-]?\s*([A-Z]{0,4}[\s-]?\d[\d\s-]{5,20})/i,
      /\b(LG\s*\d{7,14})\b/i,
    ]);
    const carat = number(capture(text, [
      /carat\s+weight\s*[:#-]?\s*(\d{1,2}(?:\.\d{1,3})?)/i,
      /\b(\d{1,2}(?:\.\d{1,3})?)\s*(?:carats?|ct\.?)(?:\s|$)/i,
    ]));
    const measurements = parseMeasurements(text);
    const tablePct = number(labeledValue(text, "table", "\\d{1,3}(?:\\.\\d+)?\\s*%"));
    const depthPct = number(labeledValue(text, "total\\s+depth|depth", "\\d{1,3}(?:\\.\\d+)?\\s*%"));
    const result = {
      lab,
      labLabel: lab ? LABS[lab].label : null,
      verifyUrl: lab ? LABS[lab].verifyUrl : null,
      reportNumber: reportNumber ? reportNumber.replace(/\s+/g, "").toUpperCase() : null,
      reportDate: capture(text, [
        /(?:report\s+date|date)\s*[:#-]?\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+\d{4})/i,
        /(?:report\s+date|date)\s*[:#-]?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
      ]),
      shape: shape.key,
      shapeLabel: shape.label,
      carat,
      measurements,
      color: labeledValue(text, "color(?:\\s+grade)?", "D|E|F|G|H|I|J|K|L|M|N|O-P|Q-R|S-T|U-V|W-X|Y-Z|FANCY(?:\\s+[A-Z]+){1,4}"),
      clarity: labeledValue(text, "clarity(?:\\s+grade)?", "FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3"),
      polish: labeledValue(text, "polish", "EXCELLENT|VERY\\s+GOOD|GOOD|FAIR|POOR"),
      symmetry: labeledValue(text, "symmetry", "EXCELLENT|VERY\\s+GOOD|GOOD|FAIR|POOR"),
      fluorescence: labeledValue(text, "fluorescence(?:\\s+intensity)?", "NONE|FAINT|MEDIUM|STRONG|VERY\\s+STRONG"),
      tablePct,
      depthPct,
      rawCharacterCount: text.length,
    };
    result.ratio = measurements && measurements.width
      ? Number((measurements.length / measurements.width).toFixed(2))
      : null;
    result.commerceShape = ["round", "oval", "emerald", "dutch_marquise"].includes(result.shape)
      ? result.shape
      : null;
    result.foundFields = Object.entries(result).filter(([key, item]) => {
      if (["rawCharacterCount", "foundFields", "commerceShape", "verifyUrl", "labLabel"].includes(key)) return false;
      return item !== null && item !== "";
    }).map(([key]) => key);
    result.confidence = result.lab && result.reportNumber && result.carat && result.measurements
      ? "strong"
      : (result.carat && (result.measurements || result.shape) ? "partial" : "insufficient");
    return result;
  }

  function reportEmailDetails(report) {
    if (!report) return "";
    const items = [];
    if (report.labLabel) items.push("Lab: " + report.labLabel);
    if (report.color) items.push("Color: " + report.color.toUpperCase());
    if (report.clarity) items.push("Clarity: " + report.clarity.toUpperCase());
    if (report.polish) items.push("Polish: " + report.polish.toLowerCase());
    if (report.symmetry) items.push("Symmetry: " + report.symmetry.toLowerCase());
    if (report.fluorescence) items.push("Fluorescence: " + report.fluorescence.toLowerCase());
    if (report.tablePct !== null) items.push("Table: " + report.tablePct + "%");
    if (report.depthPct !== null) items.push("Depth: " + report.depthPct + "%");
    return items.join("; ");
  }

  const api = Object.freeze({ LABS, cleanText, parseReportText, reportEmailDetails });
  root.FacetReportLens = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
