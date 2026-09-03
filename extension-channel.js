(function (root) {
  "use strict";
  const config = Object.freeze({ channel: "github" });
  root.FacetExtensionConfig = config;
  if (typeof module !== "undefined" && module.exports) module.exports = config;
})(typeof globalThis !== "undefined" ? globalThis : this);
