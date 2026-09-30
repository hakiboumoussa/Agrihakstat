// Fonction serverless Vercel (Node.js). Déployée automatiquement par Vercel
// à partir de ce fichier — aucune configuration supplémentaire requise,
// hormis la variable d'environnement ANTHROPIC_API_KEY (voir README.md).

const { checkRateLimit } = require("./_rateLimit.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée." });
    return;
  }

  // Cette fonction appelle l'API Anthropic avec une clé facturée à l'usage, sans authentification
  // applicative en amont (accessible à quiconque connaît l'URL) : une limitation de débit best-effort
  // (cf. _rateLimit.js) réduit le risque d'abus/de coût incontrôlé.
  const rl = checkRateLimit(req, { limit: 8, windowMs: 60000 });
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSeconds));
    res.status(429).json({ error: `Trop de requêtes de génération de rapport en peu de temps. Réessayez dans ${rl.retryAfterSeconds} seconde(s).` });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "Clé ANTHROPIC_API_KEY non configurée côté serveur. Ajoutez-la dans Vercel → Settings → Environment Variables, puis redéployez.",
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { context, analyses, univariateAnalyses } = body || {};

  if ((!analyses || analyses.length === 0) && (!univariateAnalyses || univariateAnalyses.length === 0)) {
    res.status(400).json({ error: "Aucune analyse fournie pour la rédaction du rapport." });
    return;
  }

  const ctx = context || {};
  const contextText = [
    `Objectif de l'étude : ${ctx.objectif || "non renseigné"}`,
    `Zone géographique : ${(ctx.communes || []).join(", ") || "non renseignée"}`,
    `Filière(s) concernée(s) : ${(ctx.filieres || []).join(", ") || "non renseignée(s)"}`,
    `Période de référence : ${ctx.periodeDebut || "?"} au ${ctx.periodeFin || "?"}`,
    `Unité d'analyse : ${ctx.uniteAnalyse || "non renseignée"}`,
    `Indicateurs de performance déclarés : ${(ctx.indicateurs || []).map((k) => `${k.nom} (formule : ${k.formule || "ND"}, seuil : ${k.seuil || "ND"})`).join(" ; ") || "aucun"}`,
  ].join("\n");

  const analysesText = (analyses || [])
    .map((a, i) => `Analyse ${i + 1} — ${a.label} : test « ${a.test} » (${a.status === "adjusted" ? "ajusté par l'analyste" : "proposé automatiquement"}). Résultat calculé : ${a.detail || "non disponible"}.`)
    .join("\n");

  const univariateText = (univariateAnalyses || [])
    .map((u) => {
      const s = u.stats;
      if (u.isQuantitative) {
        return `Variable « ${u.variableLabel} » (univariée) : moyenne = ${s.moyenne?.toFixed(2)}, médiane = ${s.mediane?.toFixed(2)}, écart-type = ${s.ecartType?.toFixed(2)}, min = ${s.min?.toFixed(2)}, max = ${s.max?.toFixed(2)}${s.outliers?.count > 0 ? `, ${s.outliers.count} valeur(s) atypique(s) détectée(s) (méthode interquartile)` : ""}.`;
      }
      return `Variable « ${u.variableLabel} » (univariée, qualitative) : ${(s || []).map((f) => `${f.modalite} ${f.pct?.toFixed(0)}%`).join(", ")}.`;
    })
    .join("\n");

  const systemPrompt = `Tu es un statisticien-rédacteur spécialisé dans les rapports institutionnels du secteur agricole en Afrique de l'Ouest. Tu rédiges en français soutenu, rigoureux, dans un style scientifique et institutionnel — jamais familier, jamais emphatique. Tu ne dois JAMAIS inventer de chiffres, de résultats ou de sources qui ne te sont pas fournis : tu t'appuies strictement sur le contexte et les résultats statistiques donnés. Si un lien de causalité n'est pas démontré par les données, tu le formules comme une hypothèse à vérifier, jamais comme une certitude. Réponds uniquement avec un objet JSON valide, sans balise de code, contenant exactement trois clés : "analyse", "recommandations", "conclusion" (chacune une chaîne de texte en français, plusieurs phrases, sans markdown).`;

  const userPrompt = `Voici le contexte de l'étude :\n${contextText}\n\nVoici les statistiques univariées validées à intégrer :\n${univariateText || "aucune"}\n\nVoici les résultats statistiques bivariés réellement calculés à intégrer :\n${analysesText || "aucun"}\n\nRédige :\n1. "analyse" : une lecture croisée des résultats ci-dessus, reliés au contexte de l'étude et aux indicateurs déclarés, avec la significativité statistique de chaque résultat mentionnée explicitement.\n2. "recommandations" : des recommandations opérationnelles découlant strictement des constats de l'analyse, adaptées au contexte agricole décrit.\n3. "conclusion" : une synthèse générale en 3 à 4 phrases.`;

  // Sans délai d'expiration explicite, un appel qui reste sans réponse (Anthropic indisponible,
  // connexion réseau dégradée) bloquerait la fonction jusqu'à la limite d'exécution de la
  // plateforme, sans retour exploitable pour l'utilisateur avant ce délai.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1800,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || "Erreur de l'API Anthropic." });
      return;
    }

    const textBlock = (data.content || []).find((b) => b.type === "text");
    let raw = textBlock ? textBlock.text : "{}";
    raw = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { analyse: raw, recommandations: "", conclusion: "" };
    }

    res.status(200).json({
      analyse: parsed.analyse || "",
      recommandations: parsed.recommandations || "",
      conclusion: parsed.conclusion || "",
    });
  } catch (e) {
    clearTimeout(timer);
    const timedOut = e.name === "AbortError";
    res.status(timedOut ? 504 : 500).json({
      error: timedOut ? "Le service Claude n'a pas répondu à temps pour générer ce rapport — réessayez." : "Échec de l'appel à l'API Claude : " + e.message,
    });
  }
};
