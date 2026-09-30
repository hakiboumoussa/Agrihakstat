// Limitation de débit best-effort pour les fonctions serverless appelant l'API Anthropic
// (generate-report.js, suggest-analyses.js). Préfixé par « _ » pour que Vercel ne le déploie pas
// comme un point d'accès à part entière (convention officielle des fonctions serverless Vercel).
//
// Portée assumée : une fonction Vercel Node.js n'a pas de mémoire durable partagée entre les
// multiples instances susceptibles de traiter les requêtes d'un même appelant ; ce compteur, gardé
// en mémoire de module, ne protège donc qu'à l'intérieur d'une même instance « chaude ». Il ne
// remplace pas une limitation de débit distribuée (nécessiterait un magasin partagé type Upstash
// Redis, hors périmètre de cette maquette) mais absorbe utilement les rafales accidentelles
// (double-clic, script de test en boucle, clé exposée par erreur) sans dépendance supplémentaire —
// ces deux fonctions appellent l'API Anthropic avec une clé facturée à l'usage, non protégée par
// une authentification applicative.
const buckets = new Map();

function clientIp(req) {
  const fwd = req.headers?.["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "inconnu";
}

// Retourne { allowed, remaining, retryAfterSeconds }. `limit` requêtes autorisées par fenêtre
// glissante de `windowMs` millisecondes et par IP cliente.
function checkRateLimit(req, { limit = 10, windowMs = 60000 } = {}) {
  const key = clientIp(req);
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    bucket = { windowStart: now, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  // Purge périodique des entrées expirées pour éviter une croissance non bornée de la Map sur une
  // instance restée chaude longtemps.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now - b.windowStart > windowMs) buckets.delete(k);
    }
  }

  const allowed = bucket.count <= limit;
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.windowStart + windowMs - now) / 1000));
  return { allowed, remaining: Math.max(0, limit - bucket.count), retryAfterSeconds };
}

module.exports = { checkRateLimit };
