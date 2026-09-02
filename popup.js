// Facet popup. Same face-up anchors and method as diamond-mcp (facts.json, 2026-07-10).
const { SHAPES, faceUpSize, parseListing, trackedCollectionUrl, comparisonBrief } = FacetCore;
const PX_PER_MM = 4; // the ruler's 10 mm box is 40px wide

const ct = document.getElementById("ct");
const shape = document.getElementById("shape");
const mm = document.getElementById("mm");
const ctlbl = document.getElementById("ctlbl");
const stone = document.getElementById("stone");
const matchLink = document.getElementById("match");

function render() {
  const result = faceUpSize(shape.value, ct.value) || faceUpSize("oval", 1);
  mm.textContent = result.lengthMm.toFixed(1) + " x " + result.widthMm.toFixed(1) + " mm";
  ctlbl.textContent = "for " + result.carat.toFixed(2) + " ct";
  stone.style.width = (result.lengthMm * PX_PER_MM) + "px";
  stone.style.height = (result.widthMm * PX_PER_MM) + "px";
  stone.style.top = Math.max(0, 44 - result.widthMm * PX_PER_MM) + "px";
  stone.style.borderRadius = shape.value === "round" ? "50%" : (shape.value === "emerald" ? "2px" : "50% / 50%");
  stone.style.clipPath = result.shape === "dutch_marquise"
    ? "polygon(0 50%, 20% 0, 80% 0, 100% 50%, 80% 100%, 20% 100%)"
    : (result.shape === "emerald" ? "polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)" : "none");
  matchLink.href = trackedCollectionUrl({ shape: result.shape, carat: result.carat, content: "extension_match" });
  matchLink.textContent = "Browse " + SHAPES[result.shape].label + " diamonds";
}
ct.addEventListener("input", render);
shape.addEventListener("change", render);
render();

// Scan the active tab's visible text for a carat weight near a shape word. Read-only,
// runs only when the user clicks, uses activeTab (no background access to any site).
document.getElementById("scan").addEventListener("click", async () => {
  const out = document.getElementById("scan-out");
  out.textContent = "Scanning...";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return (document.body && document.body.innerText || "").slice(0, 250000);
      },
    });
    const hit = parseListing((res && res.result) || "");
    if (!hit) { out.textContent = "No carat weight found on this page."; return; }
    ct.value = hit.carat;
    if (hit.shape) shape.value = hit.shape;
    render();
    out.textContent = hit.shape
      ? "Found " + hit.carat.toFixed(2) + " ct " + SHAPES[hit.shape].label + " on this page."
      : "Found " + hit.carat.toFixed(2) + " ct. Choose the shape to finish the check.";
  } catch (e) {
    out.textContent = "Could not read this page (some pages block scripts). Type the carat and shape instead.";
  }
});

document.getElementById("copy").addEventListener("click", async () => {
  const out = document.getElementById("copy-out");
  try {
    await navigator.clipboard.writeText(comparisonBrief(shape.value, ct.value));
    out.textContent = "Comparison brief copied.";
  } catch (e) {
    out.textContent = "Copy was blocked. You can still use the measurements above.";
  }
});
