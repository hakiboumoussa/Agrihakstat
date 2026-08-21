// Fonction serverless Vercel — propose des analyses pertinentes (paires de variables
// + justification) à partir du contexte d'étude et des colonnes réellement détectées.
// La clé ANTHROPIC_API_KEY reste côté serveur (voir README.md).

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée." });
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
  const { context, columns } = body || {};

  if (!columns || columns.length < 2) {
    res.status(400).json({ error: "Au moins deux variables sont nécessaires pour proposer une analyse." });
    return;
  }

  const ctx = context || {};
  const columnsText = columns
    .map((c) => `- ${c.name} (${c.isQuantitative ? "quantitative" : "qualitative"}${c.type ? `, ${c.type}` : ""})`)
    .join("\n");

  const contextText = [
    `Objectif de l'étude : ${ctx.objectif || "non renseigné"}`,
    `Filière(s) : ${(ctx.filieres || []).join(", ") || "non renseignée(s)"}`,
    `Zone géographique : ${(ctx.communes || []).join(", ") || "non renseignée"}`,
    `Indicateurs de performance déclarés : ${(ctx.indicateurs || []).map((k) => k.nom).join(", ") || "aucun"}`,
  ].join("\n");

  const systemPrompt = `Tu es un statisticien conseil en agro-économie. On te donne la liste des variables réellement présentes dans une base de données, avec leur type détecté, ainsi que le contexte d'une étude. Tu proposes entre 3 et 5 analyses bivariées pertinentes (des paires de variables à croiser), en te basant strictement sur les variables fournies — jamais une variable qui n'existe pas dans la liste. Réponds uniquement par un tableau JSON valide, sans texte autour ni balise de code, où chaque élément a exactement trois clés : "xId" (nom exact de la première variable), "yId" (nom exact de la seconde variable), "rationale" (une phrase en français expliquant l'intérêt de ce croisement au regard du contexte et des indicateurs).`;

  const userPrompt = `Variables disponibles :\n${columnsText}\n\nContexte de l'étude :\n${contextText}\n\nPropose les croisements de variables les plus pertinents.`;

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
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || "Erreur de l'API Anthropic." });
      return;
    }

    const textBlock = (data.content || []).find((b) => b.type === "text");
    let raw = textBlock ? textBlock.text : "[]";
    raw = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    let suggestions;
    try {
      suggestions = JSON.parse(raw);
    } catch {
      suggestions = [];
    }

    // Filtrage de sécurité : ne retenir que des suggestions référençant des colonnes réellement présentes
    const validNames = new Set(columns.map((c) => c.name));
    suggestions = (Array.isArray(suggestions) ? suggestions : [])
      .filter((s) => validNames.has(s.xId) && validNames.has(s.yId) && s.xId !== s.yId)
      .slice(0, 5);

    res.status(200).json({ suggestions });
  } catch (e) {
    res.status(500).json({ error: "Échec de l'appel à l'API Claude : " + e.message });
  }
};
