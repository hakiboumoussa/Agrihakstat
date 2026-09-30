import {
  Download,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// src/chartExport.js
var import_react = __toESM(require_react());
function svgContainerToCanvas(containerEl, scale = 2) {
  return new Promise((resolve, reject) => {
    if (!containerEl) {
      resolve(null);
      return;
    }
    const svg = containerEl.querySelector(".recharts-wrapper > svg.recharts-surface") || containerEl.querySelector(".recharts-wrapper > svg") || containerEl.querySelector("svg");
    if (!svg) {
      resolve(null);
      return;
    }
    const svgClone = svg.cloneNode(true);
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const bbox = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(bbox.width) || 800);
    const height = Math.max(1, Math.round(bbox.height) || 400);
    svgClone.setAttribute("width", width);
    svgClone.setAttribute("height", height);
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve({ canvas, width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("\xC9chec du rendu SVG en image."));
    };
    img.src = url;
  });
}
function downloadChartAsPNG(containerEl, filename) {
  svgContainerToCanvas(containerEl, 2).then((result) => {
    if (!result) return;
    result.canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      const safeName = (filename || "graphe").replace(/[^a-zA-Z0-9_\-À-ÿ]+/g, "_");
      link.download = `${safeName}.png`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 2e3);
    }, "image/png");
  }).catch(() => {
  });
}
async function captureChartAsDataURL(containerEl, scale = 2) {
  try {
    const result = await svgContainerToCanvas(containerEl, scale);
    if (!result) return null;
    return { dataUrl: result.canvas.toDataURL("image/png"), width: result.width, height: result.height };
  } catch {
    return null;
  }
}
function ChartExportButton({ targetRef, filename, title }) {
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => downloadChartAsPNG(targetRef?.current, filename),
      title: title || "Exporter ce graphe en image (.png)",
      className: "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
    },
    /* @__PURE__ */ import_react.default.createElement(Download, { size: 12 }),
    /* @__PURE__ */ import_react.default.createElement("span", { className: "hidden sm:inline" }, "PNG")
  );
}

export {
  captureChartAsDataURL,
  ChartExportButton
};
