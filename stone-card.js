(function () {
  "use strict";

  const shapeInput = document.getElementById("shape");
  const caratInput = document.getElementById("carat");
  const canvas = document.getElementById("card");
  const feedback = document.getElementById("feedback");
  const returnUrl = document.getElementById("return-url");
  const context = canvas.getContext("2d");
  const params = new URLSearchParams(location.search);
  const startingShape = FacetCore.normalizeShape(params.get("shape"));
  const startingCarat = FacetCore.clampCarat(params.get("carat"));
  if (startingShape) shapeInput.value = startingShape;
  if (startingCarat) caratInput.value = startingCarat.toFixed(2);

  function polygon(points) {
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index += 1) context.lineTo(points[index][0], points[index][1]);
    context.closePath();
  }

  function outlinePoints(shape, centerX, centerY, width, height) {
    if (shape === "dutch_marquise") {
      return [
        [centerX - width / 2, centerY],
        [centerX - width * 0.3, centerY - height / 2],
        [centerX + width * 0.3, centerY - height / 2],
        [centerX + width / 2, centerY],
        [centerX + width * 0.3, centerY + height / 2],
        [centerX - width * 0.3, centerY + height / 2],
      ];
    }
    if (shape === "emerald") {
      return [
        [centerX - width * 0.38, centerY - height / 2],
        [centerX + width * 0.38, centerY - height / 2],
        [centerX + width / 2, centerY - height * 0.38],
        [centerX + width / 2, centerY + height * 0.38],
        [centerX + width * 0.38, centerY + height / 2],
        [centerX - width * 0.38, centerY + height / 2],
        [centerX - width / 2, centerY + height * 0.38],
        [centerX - width / 2, centerY - height * 0.38],
      ];
    }
    return null;
  }

  function drawStone(result) {
    const centerX = 600;
    const centerY = 670;
    const maxDimension = 500;
    const scale = maxDimension / Math.max(result.lengthMm, result.widthMm);
    const width = result.lengthMm * scale;
    const height = result.widthMm * scale;
    context.save();
    context.strokeStyle = "#6f86a8";
    context.lineWidth = 8;
    context.fillStyle = "#eef3f8";
    const points = outlinePoints(result.shape, centerX, centerY, width, height);
    if (points) {
      polygon(points);
    } else {
      context.beginPath();
      context.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
    }
    context.fill();
    context.stroke();
    context.strokeStyle = "#b2c0d1";
    context.lineWidth = 3;
    if (points) {
      for (const point of points) {
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(point[0], point[1]);
        context.stroke();
      }
    } else {
      context.beginPath();
      context.moveTo(centerX - width / 2, centerY);
      context.lineTo(centerX + width / 2, centerY);
      context.moveTo(centerX, centerY - height / 2);
      context.lineTo(centerX, centerY + height / 2);
      context.stroke();
    }
    context.restore();
  }

  function render() {
    const result = FacetCore.faceUpSize(shapeInput.value, caratInput.value) || FacetCore.faceUpSize("oval", 1.5);
    const entryUrl = FacetCore.shareCardUrl(result.shape, result.carat);
    returnUrl.textContent = entryUrl;
    context.fillStyle = "#f8f5ef";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#091d2e";
    context.font = "28px Verdana, sans-serif";
    context.letterSpacing = "4px";
    context.fillText("FACET BY STIENHARDT", 90, 105);
    context.letterSpacing = "0px";
    context.font = "64px Georgia, serif";
    context.fillText(FacetCore.SHAPES[result.shape].label + ", " + result.carat.toFixed(2) + " ct", 90, 220);
    context.font = "38px Georgia, serif";
    context.fillStyle = "#314453";
    context.fillText("Approximate face-up size", 90, 285);
    drawStone(result);
    context.textAlign = "center";
    context.fillStyle = "#091d2e";
    context.font = "72px Georgia, serif";
    context.fillText(result.lengthMm.toFixed(1) + " x " + result.widthMm.toFixed(1) + " mm", 600, 1020);
    context.font = "27px Verdana, sans-serif";
    context.fillStyle = "#6d675f";
    context.fillText("Carat is weight. Millimeters describe the face you see.", 600, 1080);
    const qrCanvas = document.createElement("canvas");
    qrCanvas.width = 512;
    qrCanvas.height = 512;
    FacetQr.draw(qrCanvas, entryUrl);
    context.drawImage(qrCanvas, 90, 1170, 220, 220);
    context.textAlign = "left";
    context.fillStyle = "#091d2e";
    context.font = "34px Georgia, serif";
    context.fillText("Scan to reopen this size check", 350, 1250);
    context.fillStyle = "#6d675f";
    context.font = "22px Verdana, sans-serif";
    context.fillText("No account, listing, seller, price, or report number", 350, 1302);
    context.fillText("Approximate only. Confirm the grading-report measurements.", 350, 1342);
    context.strokeStyle = "#d9d1c4";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(90, 1430);
    context.lineTo(1110, 1430);
    context.stroke();
    context.font = "20px Verdana, sans-serif";
    context.fillText("jacobiusmakes.github.io/facet-diamond-tool", 90, 1470);
  }

  function filename() {
    return "facet-" + shapeInput.value.replace(/_/g, "-") + "-" + Number(caratInput.value || 1.5).toFixed(2).replace(".", "-") + "ct-stone-card.png";
  }

  shapeInput.addEventListener("change", render);
  caratInput.addEventListener("input", render);
  document.getElementById("download").addEventListener("click", async () => {
    const saved = await FacetQr.download(canvas, filename());
    feedback.textContent = saved ? "Stone Card PNG downloaded." : "The PNG download was blocked.";
  });
  document.getElementById("share").addEventListener("click", async () => {
    const blob = await FacetQr.toBlob(canvas);
    if (!blob) { feedback.textContent = "The share image could not be created."; return; }
    const file = new File([blob], filename(), { type: "image/png" });
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "Facet Stone Card", text: "A private diamond size check", files: [file] });
        feedback.textContent = "Stone Card shared.";
      } else {
        await FacetQr.download(canvas, filename());
        feedback.textContent = "Sharing files is unavailable here, so the PNG was downloaded.";
      }
    } catch (error) {
      if (!error || error.name !== "AbortError") feedback.textContent = "Sharing was blocked. You can download the PNG instead.";
    }
  });
  render();
})();
