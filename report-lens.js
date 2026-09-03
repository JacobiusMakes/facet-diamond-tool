import * as pdfjsLib from "./vendor/pdfjs/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).toString();

const fileInput = document.getElementById("report-file");
const pasteInput = document.getElementById("report-text");
const status = document.getElementById("status");
const empty = document.getElementById("empty");
const resultPanel = document.getElementById("result");
const facts = document.getElementById("facts");
const quality = document.getElementById("quality");
const title = document.getElementById("result-title");
const explanation = document.getElementById("explanation");
const verify = document.getElementById("verify");
const browse = document.getElementById("browse");
const spread = document.getElementById("spread");
const ask = document.getElementById("ask");
const copy = document.getElementById("copy");
let activeReport = null;
let activeBrief = "";
let activeCode = null;

function fact(label, value) {
  if (value === null || value === undefined || value === "") return "";
  return '<div class="fact"><span>' + label + "</span><b>" + String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])) + "</b></div>";
}

function cleanBrief(report) {
  const rows = ["Diamond report brief"];
  if (report.labLabel) rows.push("Lab: " + report.labLabel);
  if (report.reportNumber) rows.push("Report number: " + report.reportNumber);
  if (report.reportDate) rows.push("Report date: " + report.reportDate);
  if (report.shapeLabel) rows.push("Shape: " + report.shapeLabel);
  if (report.carat !== null) rows.push("Carat weight: " + report.carat.toFixed(2) + " ct");
  if (report.measurements) rows.push("Measurements: " + report.measurements.display);
  if (report.ratio !== null) rows.push("Length-to-width ratio: " + report.ratio.toFixed(2));
  if (report.color) rows.push("Color: " + report.color.toUpperCase());
  if (report.clarity) rows.push("Clarity: " + report.clarity.toUpperCase());
  if (report.tablePct !== null) rows.push("Table: " + report.tablePct + "%");
  if (report.depthPct !== null) rows.push("Depth: " + report.depthPct + "%");
  if (report.polish) rows.push("Polish: " + report.polish);
  if (report.symmetry) rows.push("Symmetry: " + report.symmetry);
  if (report.fluorescence) rows.push("Fluorescence: " + report.fluorescence);
  rows.push("Confirm every field on the original report and verify with the grading lab.");
  return rows.join("\n");
}

function render(report) {
  activeReport = report;
  activeBrief = cleanBrief(report);
  activeCode = report.commerceShape && report.carat !== null
    ? FacetCore.intentCode(report.commerceShape, report.carat)
    : null;
  empty.hidden = true;
  resultPanel.hidden = false;
  title.textContent = [report.labLabel, report.shapeLabel, report.carat !== null ? report.carat.toFixed(2) + " ct" : null].filter(Boolean).join(" ") || "Partial report extraction";
  quality.textContent = report.confidence === "strong" ? "Strong extraction" : (report.confidence === "partial" ? "Partial extraction" : "Needs manual entry");
  quality.className = "quality" + (report.confidence === "strong" ? "" : " partial");
  facts.innerHTML = [
    fact("Lab", report.labLabel),
    fact("Report number", report.reportNumber),
    fact("Report date", report.reportDate),
    fact("Shape", report.shapeLabel),
    fact("Carat", report.carat !== null ? report.carat.toFixed(2) + " ct" : null),
    fact("Measurements", report.measurements && report.measurements.display),
    fact("Length-to-width", report.ratio !== null ? report.ratio.toFixed(2) : null),
    fact("Color", report.color && report.color.toUpperCase()),
    fact("Clarity", report.clarity && report.clarity.toUpperCase()),
    fact("Table", report.tablePct !== null ? report.tablePct + "%" : null),
    fact("Depth", report.depthPct !== null ? report.depthPct + "%" : null),
    fact("Polish", report.polish),
    fact("Symmetry", report.symmetry),
    fact("Fluorescence", report.fluorescence),
  ].join("") || fact("Extraction", "No recognized report fields");

  const found = report.foundFields.length;
  explanation.innerHTML = report.measurements
    ? "Facet found <strong>" + found + " report fields</strong>. The listed measurements are the exact face-up dimensions printed on this document, so they are more useful than a carat-based estimate."
    : "Facet found <strong>" + found + " report fields</strong>, but it did not find exact measurements. Check the original document before comparing face-up size.";

  verify.hidden = !report.verifyUrl;
  if (report.verifyUrl) verify.href = report.verifyUrl;

  const canMatch = report.commerceShape && report.carat !== null;
  browse.hidden = !canMatch;
  spread.hidden = !(canMatch && report.measurements);
  ask.hidden = !canMatch;
  if (canMatch) {
    browse.href = FacetCore.trackedCollectionUrl({ shape: report.commerceShape, carat: report.carat, content: "report_lens_match" });
    browse.textContent = "Browse " + report.shapeLabel + " diamonds";
    if (report.measurements) {
      const spreadUrl = new URL("spread-check.html", location.href);
      spreadUrl.searchParams.set("shape", report.commerceShape);
      spreadUrl.searchParams.set("carat", report.carat.toFixed(2));
      spreadUrl.searchParams.set("length", report.measurements.length.toFixed(2));
      spreadUrl.searchParams.set("width", report.measurements.width.toFixed(2));
      spread.href = spreadUrl.toString();
    }
    ask.href = FacetCore.intentEmailUrl({
      shape: report.commerceShape,
      carat: report.carat,
      surface: "report_lens_intent",
      code: activeCode,
      measurements: report.measurements,
      details: FacetReportLens.reportEmailDetails(report),
    });
  }
  status.textContent = report.confidence === "insufficient"
    ? "Very little report text was recognized. If this is a scanned PDF, copy text from the image and paste it here."
    : "Report fields extracted locally. Nothing was uploaded.";
}

async function extractPdf(file) {
  if (!file || file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Choose a PDF file.");
  if (file.size > 15 * 1024 * 1024) throw new Error("This PDF is larger than 15 MB.");
  status.textContent = "Reading the PDF on this device...";
  const data = new Uint8Array(await file.arrayBuffer());
  const documentTask = pdfjsLib.getDocument({ data, isEvalSupported: false });
  const pdf = await documentTask.promise;
  const pageTexts = [];
  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 12); pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pageTexts.push(content.items.map((item) => item.str + (item.hasEOL ? "\n" : " ")).join(" "));
  }
  const text = pageTexts.join("\n").trim();
  if (!text) throw new Error("No selectable text was found. This appears to be a scanned report. Paste text copied from the image instead.");
  pasteInput.value = text;
  render(FacetReportLens.parseReportText(text));
}

fileInput.addEventListener("change", async () => {
  try {
    await extractPdf(fileInput.files[0]);
  } catch (error) {
    status.textContent = error && error.message ? error.message : "Facet could not read this PDF.";
  }
});

document.getElementById("analyze-text").addEventListener("click", () => {
  const text = pasteInput.value.trim();
  if (!text) {
    status.textContent = "Paste report text first.";
    return;
  }
  render(FacetReportLens.parseReportText(text));
});

document.getElementById("clear").addEventListener("click", () => {
  fileInput.value = "";
  pasteInput.value = "";
  status.textContent = "Report cleared from this page.";
  activeReport = null;
  activeBrief = "";
  activeCode = null;
  resultPanel.hidden = true;
  empty.hidden = false;
});

copy.addEventListener("click", async () => {
  if (!activeBrief) return;
  try {
    await navigator.clipboard.writeText(activeBrief);
    status.textContent = "Clean report brief copied.";
  } catch (error) {
    status.textContent = "Copy was blocked by the browser.";
  }
});

const dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", (event) => event.preventDefault());
dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  try {
    await extractPdf(event.dataTransfer.files[0]);
  } catch (error) {
    status.textContent = error && error.message ? error.message : "Facet could not read this PDF.";
  }
});
