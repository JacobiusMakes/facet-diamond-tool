(function () {
  "use strict";

  const shapeFilter = document.getElementById("shape-filter");
  const tableBody = document.getElementById("dataset-rows");
  const status = document.getElementById("dataset-status");
  let dataset = null;

  function render() {
    if (!dataset) return;
    const rows = dataset.rows.filter((row) => row.shape_slug === shapeFilter.value);
    tableBody.replaceChildren(...rows.map((row) => {
      const tr = document.createElement("tr");
      const values = [
        row.shape_label,
        Number(row.carat_weight).toFixed(2) + " ct",
        Number(row.approximate_length_mm).toFixed(2) + " mm",
        Number(row.approximate_width_mm).toFixed(2) + " mm",
      ];
      values.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      });
      const action = document.createElement("td");
      const link = document.createElement("a");
      link.href = row.facet_url;
      link.textContent = "Open in Facet";
      action.append(link);
      tr.append(action);
      return tr;
    }));
    status.textContent = rows.length + " rows shown. Version " + dataset.version + ".";
  }

  shapeFilter.addEventListener("change", render);
  fetch("data/face-up-size-reference.json")
    .then((response) => {
      if (!response.ok) throw new Error("Dataset unavailable");
      return response.json();
    })
    .then((value) => {
      dataset = value;
      render();
    })
    .catch(() => {
      status.textContent = "The table could not load. The CSV and JSON downloads remain available above.";
    });
})();
