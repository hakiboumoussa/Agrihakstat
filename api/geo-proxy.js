// Fonction serverless Vercel (Node.js). Proxy Overpass (OpenStreetMap) pour les couches
// « Cours d'eau » et « Routes principales » de la Cartographie.
//
// Pourquoi un proxy plutôt qu'un appel direct depuis le navigateur (comme précédemment) :
//  1. overpass-api.de n'annonce pas de façon fiable l'en-tête Access-Control-Allow-Origin sur
//     toutes ses instances/miroirs ; un appel navigateur direct peut donc échouer silencieusement
//     par blocage CORS, sans que l'utilisateur ne voie d'autre symptôme qu'une couche qui « ne
//     réagit pas » lorsqu'elle est cochée.
//  2. La politique d'usage équitable d'Overpass demande un en-tête User-Agent identifiant
//     l'application appelante — absent d'un simple fetch() navigateur.
//  3. Un délai serveur strict permet de renvoyer une erreur exploitable plutôt qu'une requête qui
//     reste indéfiniment « en attente » côté client.
//
// Usage côté client : /api/geo-proxy?kind=rivers|roads&s=<sud>&w=<ouest>&n=<nord>&e=<est>

const FILTERS = {
  rivers: 'way["waterway"~"^(river|stream|canal)$"]',
  roads: 'way["highway"~"^(motorway|trunk|primary|secondary)$"]',
};

module.exports = async function handler(req, res) {
  const { kind, s, w, n, e } = req.query || {};
  const filter = FILTERS[kind];
  const coords = [s, w, n, e];
  if (!filter || coords.some((v) => v === undefined || v === "" || isNaN(Number(v)))) {
    res.status(400).json({ error: "Paramètres de requête cartographique invalides." });
    return;
  }

  const query = `[out:json][timeout:20];(${filter}(${s},${w},${n},${e});); out geom;`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000);

  try {
    const upstream = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "AgriHakStat/1.0 (+https://agrihakstat.vercel.app; contact: hakiboumoussa@gmail.com)",
      },
      body: "data=" + encodeURIComponent(query),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Le service Overpass a répondu avec le code ${upstream.status}.` });
      return;
    }
    const data = await upstream.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=120");
    res.status(200).json(data);
  } catch (err) {
    clearTimeout(timer);
    const timedOut = err.name === "AbortError";
    res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? "Le service Overpass (OpenStreetMap) n'a pas répondu à temps pour cette emprise — réessayez ou zoomez davantage."
        : "Échec de la requête auprès du service Overpass : " + err.message,
    });
  }
};
