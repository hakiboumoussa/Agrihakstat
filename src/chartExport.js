// Utilitaire d'export des graphes (Recharts, rendus en SVG) au format image PNG.
// Fonctionne sans dépendance supplémentaire : sérialisation du SVG, rendu sur un
// canvas à échelle 2x (meilleure résolution pour impression/insertion dans un rapport),
// puis téléchargement du PNG obtenu.

import React from "react";
import { Download } from "lucide-react";

// Rendu commun SVG → <canvas> (fond blanc, échelle 2x), factorisé pour être réutilisé à la fois
// par le téléchargement individuel (downloadChartAsPNG) et par la capture destinée à l'export
// Word (captureChartAsDataURL, cf. exportDocx.js).
function svgContainerToCanvas(containerEl, scale = 2) {
  return new Promise((resolve, reject) => {
    if (!containerEl) { resolve(null); return; }
    // Le conteneur peut englober, en plus du graphe lui-même, de petites icônes SVG de
    // légende (recharts rend chaque puce de légende comme un <svg class="recharts-surface">
    // à part entière). On cible donc en priorité le SVG principal rendu par
    // <ResponsiveContainer> (enfant direct de .recharts-wrapper), et on ne retombe sur le
    // premier SVG du conteneur qu'à défaut.
    const svg =
      containerEl.querySelector(".recharts-wrapper > svg.recharts-surface") ||
      containerEl.querySelector(".recharts-wrapper > svg") ||
      containerEl.querySelector("svg");
    if (!svg) { resolve(null); return; }

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
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Échec du rendu SVG en image.")); };
    img.src = url;
  });
}

export function downloadChartAsPNG(containerEl, filename) {
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
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    }, "image/png");
  }).catch(() => {});
}

// Capture un graphe Recharts déjà monté dans le DOM en image PNG encodée en data URL, sans
// déclencher de téléchargement — utilisé pour intégrer les graphiques au rapport Word généré
// (cf. exportReportToDocx dans exportDocx.js). Retourne null si le conteneur n'est pas disponible
// (carte non rendue à l'écran au moment de l'export, par exemple).
export async function captureChartAsDataURL(containerEl, scale = 2) {
  try {
    const result = await svgContainerToCanvas(containerEl, scale);
    if (!result) return null;
    return { dataUrl: result.canvas.toDataURL("image/png"), width: result.width, height: result.height };
  } catch {
    return null;
  }
}

// Bouton d'export réutilisable, à placer dans l'en-tête de n'importe quelle carte
// contenant un graphe Recharts. `targetRef` doit pointer vers un élément conteneur
// (div) englobant le <ResponsiveContainer> du graphe à exporter.
export function ChartExportButton({ targetRef, filename, title }) {
  return (
    <button
      type="button"
      onClick={() => downloadChartAsPNG(targetRef?.current, filename)}
      title={title || "Exporter ce graphe en image (.png)"}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <Download size={12} />
      <span className="hidden sm:inline">PNG</span>
    </button>
  );
}
