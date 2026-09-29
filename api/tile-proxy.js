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

// Conversion tuile XYZ (Web Mercator) → emprise géographique (WGS84), nécessaire pour interroger
// un service WMS (GetMap) tuile par tuile avec la même convention z/x/y que les fournisseurs
// raster classiques. Référence : https://en.wikipedia.org/wiki/Web_Mercator_projection
function tileToBBox(z, x, y) {
  const n = Math.pow(2, Number(z));
  const lonMin = (Number(x) / n) * 360 - 180;
  const lonMax = ((Number(x) + 1) / n) * 360 - 180;
  const latOf = (yTile) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * yTile) / n))) * 180) / Math.PI;
  const latMax = latOf(Number(y));
  const latMin = latOf(Number(y) + 1);
  return { lonMin, lonMax, latMin, latMax };
}

const PROVIDERS = {
  clair: { host: () => "maps.wikimedia.org", path: (z, x, y) => `/osm-intl/${z}/${x}/${y}.png` },
  osm: { host: () => `${pick()}.tile.openstreetmap.org`, path: (z, x, y) => `/${z}/${x}/${y}.png` },
  satellite: {
    host: () => "server.arcgisonline.com",
    path: (z, x, y) => `/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  },
  relief: { host: () => `${pick()}.tile.opentopomap.org`, path: (z, x, y) => `/${z}/${x}/${y}.png` },
  // Couverture du sol / végétation : ESA WorldCover 2021 (10 m, 11 classes dont cultures, forêt,
  // savane/prairie, zones bâties, plans d'eau...), service WMS public de VITO/Terrascope, sans
  // clé d'API. Chaque tuile XYZ est traduite en une requête WMS GetMap classique (BBOX en
  // WGS84/EPSG:4326) via tileToBBox ci-dessus. Source : https://esa-worldcover.org/
  landcover: {
    wms: true,
    build: (z, x, y) => {
      const { lonMin, lonMax, latMin, latMax } = tileToBBox(z, x, y);
      const params = new URLSearchParams({
        SERVICE: "WMS", VERSION: "1.1.1", REQUEST: "GetMap",
        LAYERS: "WORLDCOVER_2021_MAP", STYLES: "", FORMAT: "image/png",
        TRANSPARENT: "true", SRS: "EPSG:4326",
        BBOX: `${lonMin},${latMin},${lonMax},${latMax}`,
        WIDTH: "256", HEIGHT: "256",
      });
      return `https://services.terrascope.be/wms/v2?${params.toString()}`;
    },
  },
};

module.exports = async function handler(req, res) {
  const { p, z, x, y } = req.query || {};
  const provider = PROVIDERS[p];
  if (!provider || z === undefined || x === undefined || y === undefined) {
    res.status(400).send("Paramètres de tuile invalides.");
    return;
  }

  const url = provider.wms ? provider.build(z, x, y) : `https://${provider.host()}${provider.path(z, x, y)}`;

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
