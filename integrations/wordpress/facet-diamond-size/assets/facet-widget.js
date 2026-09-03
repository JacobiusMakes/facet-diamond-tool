(function (root) {
  "use strict";

  const VERSION = "0.4.1";
  const ANCHORS = Object.freeze({
    round: [6.5, 6.5],
    oval: [8.0, 5.5],
    emerald: [7.0, 5.0],
    dutch_marquise: [9.0, 5.0],
  });
  const SHAPES = Object.freeze({
    round: { label: "Round", collection: "/collections/round-cut-lab-grown-diamonds" },
    oval: { label: "Oval", collection: "/collections/oval-cut-lab-grown-diamonds" },
    emerald: { label: "Emerald", collection: "/collections/emerald-cut-lab-grown-diamonds" },
    dutch_marquise: { label: "Dutch Marquise", collection: "/collections/dutch-marquise-lab-grown-diamonds" },
  });

  function normalizeShape(value) {
    const clean = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
    return ANCHORS[clean] ? clean : "oval";
  }

  function clampCarat(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? Math.max(0.1, Math.min(20, parsed)) : 1.5;
  }

  function sanitizePublisher(value) {
    const clean = String(value || "publisher").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
    return (clean || "publisher").slice(0, 48);
  }

  function commerceEnabled(value) {
    return !["off", "no", "false", "0"].includes(String(value || "").trim().toLowerCase());
  }

  function faceUpSize(shape, carat) {
    const key = normalizeShape(shape);
    const weight = clampCarat(carat);
    const scale = Math.cbrt(weight);
    return {
      shape: key,
      carat: weight,
      lengthMm: ANCHORS[key][0] * scale,
      widthMm: ANCHORS[key][1] * scale,
    };
  }

  function trackedUrl(shape, carat, publisher) {
    const result = faceUpSize(shape, carat);
    const url = new URL("https://stienhardt.com" + SHAPES[result.shape].collection);
    url.searchParams.set("utm_source", "facet");
    url.searchParams.set("utm_medium", "shopping_tool");
    url.searchParams.set("utm_campaign", "diamond_size_check");
    url.searchParams.set("utm_content", "web_component_" + sanitizePublisher(publisher));
    url.searchParams.set("utm_term", result.shape + "_" + result.carat.toFixed(2).replace(".", "_") + "ct");
    url.searchParams.set("facet_shape", result.shape);
    url.searchParams.set("facet_carat", result.carat.toFixed(2));
    return url.toString();
  }

  function outline(shape) {
    if (shape === "emerald") return '<polygon points="52,12 168,12 202,36 202,74 168,98 52,98 18,74 18,36"/>';
    if (shape === "dutch_marquise") return '<polygon points="10,55 55,12 165,12 210,55 165,98 55,98"/>';
    return '<ellipse cx="110" cy="55" rx="' + (shape === "round" ? "45" : "88") + '" ry="43"/>';
  }

  function facetLines(shape) {
    const left = shape === "round" ? 68 : 22;
    const right = shape === "round" ? 152 : 198;
    return '<path class="facet" d="M' + left + ' 55 L110 16 L' + right + ' 55 L110 94 Z M110 16 L110 94 M' + left + ' 55 L' + right + ' 55"/>';
  }

  const BaseElement = root.HTMLElement || class {};

  class FacetDiamondSize extends BaseElement {
    static get observedAttributes() {
      return ["shape", "carat", "publisher", "theme", "commerce"];
    }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this.paint();
    }

    attributeChangedCallback() {
      if (this.shadowRoot) this.paint();
    }

    paint() {
      const result = faceUpSize(this.getAttribute("shape"), this.getAttribute("carat"));
      const publisher = sanitizePublisher(this.getAttribute("publisher"));
      const dark = this.getAttribute("theme") === "dark";
      const commerce = commerceEnabled(this.getAttribute("commerce"));
      const facetUrl = new URL("https://jacobiusmakes.github.io/facet-diamond-tool/");
      facetUrl.searchParams.set("shape", result.shape);
      facetUrl.searchParams.set("carat", result.carat.toFixed(2));
      facetUrl.searchParams.set("via", "widget");
      facetUrl.searchParams.set("partner", publisher);

      this.shadowRoot.innerHTML = `
        <style>
          :host{display:block;max-width:620px;--fw-ink:${dark ? "#f5f8fb" : "#091d2e"};--fw-paper:${dark ? "#091d2e" : "#fffdfa"};--fw-line:${dark ? "#3d566b" : "#d9d1c4"};--fw-muted:${dark ? "#bac8d4" : "#6d675f"};--fw-blue:${dark ? "#a7c3e4" : "#173f70"};font-family:Georgia,'Times New Roman',serif;color:var(--fw-ink)}
          *{box-sizing:border-box}.card{background:var(--fw-paper);border:1px solid var(--fw-line);border-radius:8px;padding:22px;box-shadow:0 12px 30px rgba(9,29,46,.08)}
          .top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.eyebrow{margin:0 0 6px;font:600 9px/1.2 Verdana,sans-serif;text-transform:uppercase;letter-spacing:.14em;color:var(--fw-muted)}h2{font-size:25px;font-weight:400;line-height:1.08;margin:0}.badge{font:600 9px/1 Verdana,sans-serif;text-transform:uppercase;letter-spacing:.08em;border:1px solid var(--fw-line);border-radius:20px;padding:7px 9px;white-space:nowrap}
          .body{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:20px;align-items:center;margin-top:20px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}label{display:block;font:600 9px/1 Verdana,sans-serif;text-transform:uppercase;letter-spacing:.1em;color:var(--fw-muted);margin-bottom:6px}select,input{width:100%;padding:10px;border:1px solid var(--fw-line);border-radius:3px;background:var(--fw-paper);color:var(--fw-ink);font:15px Georgia,serif}.measure{margin-top:16px;padding-top:14px;border-top:1px solid var(--fw-line)}.measure strong{display:block;font-size:29px;font-weight:400}.measure span{font:10px/1.45 Verdana,sans-serif;color:var(--fw-muted)}
          .stone{display:grid;place-items:center;min-height:125px;background:${dark ? "#112b3f" : "#f4f7fa"};border:1px solid var(--fw-line);border-radius:5px}.stone svg{width:88%;height:108px;overflow:visible}.stone svg>*{fill:${dark ? "#d6e6f4" : "#e6f0f9"};stroke:var(--fw-blue);stroke-width:2}.facet{fill:none;stroke:${dark ? "#ffffff" : "#ffffff"};stroke-width:1;opacity:.9}
          .button{display:block;margin-top:16px;padding:12px 14px;background:var(--fw-ink);color:var(--fw-paper);border:1px solid var(--fw-ink);border-radius:3px;text-align:center;text-decoration:none;font:600 10px/1.2 Verdana,sans-serif;text-transform:uppercase;letter-spacing:.09em}.fine{margin:12px 0 0;font:10px/1.5 Verdana,sans-serif;color:var(--fw-muted)}.fine a{color:var(--fw-blue)}
          @media(max-width:520px){.body{grid-template-columns:1fr}.stone{min-height:108px}.top{display:block}.badge{display:inline-block;margin-top:10px}}
        </style>
        <section class="card" aria-label="Diamond face-up size calculator">
          <div class="top"><div><p class="eyebrow">Facet diamond size check</p><h2>Carat is weight. What you see is millimeters.</h2></div><span class="badge">No tracking script</span></div>
          <div class="body">
            <div>
              <div class="fields">
                <div><label for="facet-shape">Shape</label><select id="facet-shape"><option value="round">Round</option><option value="oval">Oval</option><option value="emerald">Emerald</option><option value="dutch_marquise">Dutch Marquise</option></select></div>
                <div><label for="facet-carat">Carat weight</label><input id="facet-carat" type="number" min="0.1" max="20" step="0.01" value="${result.carat.toFixed(2)}"></div>
              </div>
              <div class="measure"><strong>${result.lengthMm.toFixed(1)} x ${result.widthMm.toFixed(1)} mm</strong><span>Approximate face-up size for ${result.carat.toFixed(2)} ct. Confirm the exact grading-report measurements.</span></div>
            </div>
            <div class="stone" aria-hidden="true"><svg viewBox="0 0 220 110">${outline(result.shape)}${facetLines(result.shape)}</svg></div>
          </div>
          ${commerce ? `<a class="button" href="${trackedUrl(result.shape, result.carat, publisher)}" target="_blank" rel="noopener">Browse ${SHAPES[result.shape].label} diamonds</a>` : ""}
          <p class="fine">Facet sets no cookies and collects no customer data.${commerce ? ` The inventory link contains only publisher, shape, and carat. <a href="${facetUrl.toString()}" target="_blank" rel="noopener">Open the full Facet tool</a>` : ""}</p>
        </section>`;

      const shapeControl = this.shadowRoot.getElementById("facet-shape");
      const caratControl = this.shadowRoot.getElementById("facet-carat");
      shapeControl.value = result.shape;
      shapeControl.addEventListener("change", () => this.changeSelection(shapeControl.value, caratControl.value));
      caratControl.addEventListener("change", () => this.changeSelection(shapeControl.value, caratControl.value));
      caratControl.addEventListener("input", () => {
        clearTimeout(this.paintTimer);
        this.paintTimer = setTimeout(() => this.changeSelection(shapeControl.value, caratControl.value), 250);
      });
    }

    changeSelection(shape, carat) {
      const result = faceUpSize(shape, carat);
      this.setAttribute("shape", result.shape);
      this.setAttribute("carat", result.carat.toFixed(2));
      if (root.CustomEvent) this.dispatchEvent(new root.CustomEvent("facet-change", { detail: result, bubbles: true, composed: true }));
    }
  }

  const api = Object.freeze({ VERSION, ANCHORS, SHAPES, normalizeShape, clampCarat, sanitizePublisher, commerceEnabled, faceUpSize, trackedUrl, outline, facetLines, FacetDiamondSize });
  root.FacetWidgetCore = api;
  if (root.customElements && !root.customElements.get("facet-diamond-size")) root.customElements.define("facet-diamond-size", FacetDiamondSize);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
