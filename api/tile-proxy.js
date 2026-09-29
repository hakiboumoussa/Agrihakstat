// Fonction serverless Vercel (Node.js). Proxy de tuiles cartographiques.
//
// Pourquoi : les serveurs de tuiles publics utilisés par la Cartographie (OpenStreetMap,
// Wikimedia Maps, Esri World Imagery, OpenTopoMap) ne renvoient pas d'en-tête
// Access-Control-Allow-Origin. Une image chargée sans cet en-tête « tache » (taint) le canevas
// HTML5 dès qu'on tente d'en extraire les pixels (export PNG via html2canvas), ce que le
// navigateur bloque pour des raisons de sécurité (SecurityError: Tainted canvases may not be
// exported). En relayant chaque tuile via ce domaine et en ajoutant nous-mêmes l'en-tête CORS,
// l'export d'image de la carte devient possible sans rien changer au fournisseur de données.
//
// Usage côté client : /api/tile-proxy?p=<clé fournisseur>&z={z}&x={x}&y={y}

const SUBDOMAINS = ["a", "b", "c"];
const pick = () => SUBDOMAINS[Math.floor(Math.random() * SUBDOMAINS.length)];

const PROVIDERS = {
  clair: { host: () => "maps.wikimedia.org", path: (z, x, y) => `/osm-intl/${z}/${x}/${y}.png` },
  osm: { host: () => `${pick()}.tile.openstreetmap.org`, path: (z, x, y) => `/${z}/${x}/${y}.png` },
  satellite: {
    host: () => "server.arcgisonline.com",
    path: (z, x, y) => `/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  },
  relief: { host: () => `${pick()}.tile.opentopomap.org`, path: (z, x, y) => `/${z}/${x}/${y}.png` },
};

module.exports = async function handler(req, res) {
  const { p, z, x, y } = req.query || {};
  const provider = PROVIDERS[p];
  if (!provider || z === undefined || x === undefined || y === undefined) {
    res.status(400).send("Paramètres de tuile invalides.");
    return;
  }

  const url = `https://${provider.host()}${provider.path(z, x, y)}`;

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "AgriHakStat/1.0 (+https://agrihakstat.vercel.app; contact: hakiboumoussa@gmail.com)" },
    });
    if (!upstream.ok) {
      res.status(upstream.status).send("Tuile indisponible auprès du fournisseur.");
      return;
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/png");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).send("Échec de la récupération de la tuile : " + e.message);
  }
};
