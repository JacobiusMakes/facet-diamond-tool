(function () {
  "use strict";
  const shape = document.getElementById("shape");
  const carat = document.getElementById("carat");
  const image = document.getElementById("selected-image");
  const title = document.getElementById("selected-title");
  const measurement = document.getElementById("selected-measurement");
  const download = document.getElementById("download");
  const openFacet = document.getElementById("open-facet");
  const grid = document.getElementById("atlas-grid");
  const params = new URLSearchParams(location.search);
  let atlas = null;

  for (let value = 100; value <= 300; value += 10) {
    const option = document.createElement("option");
    option.value = (value / 100).toFixed(2);
    option.textContent = option.value + " ct";
    carat.append(option);
  }
  shape.value = ["round", "oval", "emerald", "dutch_marquise"].includes(params.get("shape")) ? params.get("shape") : "oval";
  carat.value = /^([123](?:\.\d{1,2})?)$/.test(params.get("carat") || "") ? Number(params.get("carat")).toFixed(2) : "1.50";

  function cardFor(row) {
    const article = document.createElement("article");
    article.className = "card";
    const link = document.createElement("a");
    link.href = `?shape=${encodeURIComponent(row.shape)}&carat=${encodeURIComponent(row.carat)}`;
    const cardImage = document.createElement("img");
    cardImage.src = row.download;
    cardImage.loading = "lazy";
    cardImage.width = 1200;
    cardImage.height = 675;
    cardImage.alt = `${row.carat} carat ${row.label} diamond approximate face-up size diagram`;
    const heading = document.createElement("h3");
    heading.textContent = `${row.carat} ct ${row.label}`;
    const detail = document.createElement("p");
    detail.textContent = `${row.lengthMm.toFixed(2)} × ${row.widthMm.toFixed(2)} mm`;
    link.append(cardImage, heading, detail);
    article.append(link);
    return article;
  }

  function render() {
    if (!atlas) return;
    const rows = atlas.images.filter((row) => row.shape === shape.value);
    const selected = rows.find((row) => row.carat === carat.value) || rows[0];
    image.src = selected.download;
    image.alt = `${selected.carat} carat ${selected.label} diamond approximate face-up size diagram`;
    title.textContent = `${selected.carat} ct ${selected.label}`;
    measurement.textContent = `${selected.lengthMm.toFixed(2)} × ${selected.widthMm.toFixed(2)} mm`;
    download.href = selected.download;
    openFacet.href = selected.facetUrl;
    grid.replaceChildren(...rows.map(cardFor));
  }

  shape.addEventListener("change", render);
  carat.addEventListener("change", render);
  fetch("data/size-atlas.json")
    .then((response) => {
      if (!response.ok) throw new Error("Atlas unavailable");
      return response.json();
    })
    .then((value) => {
      atlas = value;
      render();
    });
})();
