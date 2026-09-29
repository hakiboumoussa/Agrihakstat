import html2canvas from "html2canvas";

// Exporte un conteneur DOM (typiquement la carte Leaflet + son bandeau de légende) en image PNG.
// `useCORS: true` force html2canvas à recharger chaque tuile avec crossOrigin="anonymous" ; cela
// ne fonctionne que si le serveur d'origine de la tuile renvoie un en-tête
// Access-Control-Allow-Origin — d'où le passage de toutes les tuiles par /api/tile-proxy (voir ce
// fichier). Sans cet en-tête, le canevas est « taché » et l'export échoue avec une SecurityError.
export async function exportMapAsPNG(containerEl, filename) {
  if (!containerEl) return { ok: false, error: "Carte introuvable." };
  try {
    const canvas = await html2canvas(containerEl, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
    });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return { ok: false, error: "La génération de l'image a échoué." };
    const link = document.createElement("a");
    const safeName = (filename || "carte").replace(/[^a-zA-Z0-9_\-À-ÿ]+/g, "_");
    link.download = `${safeName}.png`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        "Export impossible : une partie du fond de carte n'a pas pu être rechargée en mode CORS (" +
        (e && e.message ? e.message : "erreur inconnue") +
        "). Réessayez, ou patientez que les tuiles finissent de charger.",
    };
  }
}
