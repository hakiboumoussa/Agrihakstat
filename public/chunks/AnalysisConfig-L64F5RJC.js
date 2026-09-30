import {
  chiSquareTest,
  descriptiveStats,
  frequencies,
  kruskalWallis,
  leveneTest,
  mannWhitneyU,
  normalityHint,
  numericValues,
  oneWayAnova,
  pearsonCorrelation,
  spearmanCorrelation
} from "./chunk-B7RPT2FF.js";
import {
  Sidebar,
  UserMenu
} from "./chunk-FYJTF33N.js";
import {
  Bell,
  Check,
  CircleCheck,
  CircleX,
  Info,
  Layers,
  Pencil,
  Play,
  Plus,
  ShieldCheck,
  Sigma,
  TrendingUp,
  TriangleAlert,
  WandSparkles,
  X,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// src/AnalysisConfig.jsx
var import_react = __toESM(require_react());
var NAVY = "#1F3864";
var GOLD = "#C99A2E";
var GREEN = "#256B45";
var GREEN_TINT = "#E4F5EC";
var AMBER = "#8A5A00";
var AMBER_TINT = "#FDF1DA";
var NAVY_TINT = "#EBEEF7";
var VARIABLES = [
  { id: "sup_semee", label: "Superficie sem\xE9e (ha)", type: "Quantitative continue", isQuantitative: true, normal: false },
  { id: "rendement", label: "Rendement estim\xE9 (kg/ha)", type: "Quantitative continue", isQuantitative: true, normal: true },
  { id: "filiere", label: "Fili\xE8re suivie", type: "Nominale (5 modalit\xE9s)", isQuantitative: false },
  { id: "commune", label: "Commune d'enqu\xEAte", type: "Nominale (8 modalit\xE9s)", isQuantitative: false },
  { id: "satisf_intrants", label: "Satisfaction intrants", type: "Ordinale (4 niveaux)", isQuantitative: false },
  { id: "acces_credit", label: "Acc\xE8s au cr\xE9dit agricole", type: "Nominale (2 modalit\xE9s)", isQuantitative: false },
  { id: "pluvio_decade", label: "Pluviom\xE9trie d\xE9cadaire (mm)", type: "Quantitative continue", isQuantitative: true, normal: true }
];
function isNormal(variable, dataset) {
  if (!dataset) return variable.normal;
  const vals = numericValues(dataset.rows, variable.id);
  if (vals.length < 5) return true;
  return normalityHint(vals).looksNormal;
}
function proposeTest(xId, yId, variables, dataset) {
  const x = variables.find((v) => v.id === xId);
  const y = variables.find((v) => v.id === yId);
  if (!x || !y) return null;
  const isQuantX = x.isQuantitative;
  const isQuantY = y.isQuantitative;
  if (isQuantX && isQuantY) {
    const normal = isNormal(x, dataset) && isNormal(y, dataset);
    return {
      test: normal ? "Corr\xE9lation de Pearson" : "Corr\xE9lation de Spearman",
      justification: normal ? "Les deux variables suivent une distribution approximativement normale (asym\xE9trie mod\xE9r\xE9e) : le coefficient de corr\xE9lation de Pearson est adapt\xE9." : "Au moins une variable s'\xE9carte de la normalit\xE9 (asym\xE9trie marqu\xE9e) : le coefficient de corr\xE9lation de Spearman, non param\xE9trique, est privil\xE9gi\xE9.",
      alternatives: ["Corr\xE9lation de Pearson", "Corr\xE9lation de Spearman"]
    };
  }
  if (isQuantX !== isQuantY) {
    const quant = isQuantX ? x : y;
    const qual = isQuantX ? y : x;
    const nModalites = qual.modalites ? qual.modalites.length : qual.type.includes("2 modalit\xE9s") ? 2 : 3;
    const modalites = nModalites === 2;
    const normal = isNormal(quant, dataset);
    return {
      test: modalites ? normal ? "Test de Student" : "Test de Mann-Whitney" : normal ? "ANOVA \xE0 un facteur" : "Test de Kruskal-Wallis",
      justification: `Variable qualitative \xE0 ${modalites ? "deux" : "plusieurs"} modalit\xE9s crois\xE9e avec une variable quantitative ${normal ? "approximativement normale" : "s'\xE9cartant de la normalit\xE9 (asym\xE9trie marqu\xE9e)"}.`,
      alternatives: modalites ? ["Test de Student", "Test de Mann-Whitney"] : ["ANOVA \xE0 un facteur", "Test de Kruskal-Wallis"]
    };
  }
  return {
    test: "Test du Khi\xB2 d'ind\xE9pendance",
    justification: "Deux variables qualitatives : le test du Khi\xB2 \xE9value l'ind\xE9pendance, compl\xE9t\xE9 par le V de Cram\xE9r pour la force de l'association.",
    alternatives: ["Test du Khi\xB2 d'ind\xE9pendance", "V de Cram\xE9r (mesure d'association)"]
  };
}
function computeRealStat(testName, xId, yId, dataset) {
  if (!dataset) return null;
  try {
    switch (testName) {
      case "Corr\xE9lation de Pearson": {
        const r = pearsonCorrelation(dataset.rows, xId, yId);
        return { statLabel: "r", statValue: r.r, p: r.p, n: r.n, detail: `r = ${r.r.toFixed(3)}, n = ${r.n}, p = ${r.p < 1e-3 ? "< 0,001" : r.p.toFixed(3)}` };
      }
      case "Corr\xE9lation de Spearman": {
        const r = spearmanCorrelation(dataset.rows, xId, yId);
        return { statLabel: "\u03C1", statValue: r.r, p: r.p, n: r.n, detail: `\u03C1 = ${r.r.toFixed(3)}, n = ${r.n}, p = ${r.p < 1e-3 ? "< 0,001" : r.p.toFixed(3)}` };
      }
      case "ANOVA \xE0 un facteur": {
        const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
        const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];
        const a = oneWayAnova(dataset.rows, quantCol, qualCol);
        return { statLabel: "F", statValue: a.F, p: a.p, n: a.N, detail: `F(${a.dfBetween},${a.dfWithin}) = ${a.F.toFixed(2)}, p = ${a.p < 1e-3 ? "< 0,001" : a.p.toFixed(3)}, \u03B7\xB2 = ${a.etaSq.toFixed(2)}`, raw: a };
      }
      case "Test de Kruskal-Wallis": {
        const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
        const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];
        const k = kruskalWallis(dataset.rows, quantCol, qualCol);
        return { statLabel: "H", statValue: k.H, p: k.p, n: k.N, detail: `H(${k.df}) = ${k.H.toFixed(2)}, p = ${k.p < 1e-3 ? "< 0,001" : k.p.toFixed(3)}` };
      }
      case "Test de Student":
      case "Test de Mann-Whitney": {
        const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
        const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];
        if (testName === "Test de Mann-Whitney") {
          const m = mannWhitneyU(dataset.rows, quantCol, qualCol);
          return { statLabel: "U", statValue: m.U, p: m.p, n: m.n1 + m.n2, detail: `U = ${m.U.toFixed(1)}, z = ${m.z.toFixed(2)}, p = ${m.p < 1e-3 ? "< 0,001" : m.p.toFixed(3)}` };
        }
        const a = oneWayAnova(dataset.rows, quantCol, qualCol);
        const t = Math.sqrt(a.F);
        return { statLabel: "t", statValue: t, p: a.p, n: a.N, detail: `t \u2248 ${t.toFixed(2)}, p = ${a.p < 1e-3 ? "< 0,001" : a.p.toFixed(3)}` };
      }
      case "Test du Khi\xB2 d'ind\xE9pendance":
      case "V de Cram\xE9r (mesure d'association)": {
        const c = chiSquareTest(dataset.rows, xId, yId);
        return { statLabel: "\u03C7\xB2", statValue: c.chi2, p: c.p, n: c.n, detail: `\u03C7\xB2(${c.df}) = ${c.chi2.toFixed(2)}, p = ${c.p < 1e-3 ? "< 0,001" : c.p.toFixed(3)}, V de Cram\xE9r = ${c.cramersV.toFixed(2)}`, raw: c };
      }
      default:
        return null;
    }
  } catch (e) {
    return { error: e.message };
  }
}
function getConditions(test, ctx) {
  const { dataset, xId, yId } = ctx || {};
  if (dataset) {
    try {
      const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
      const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];
      if (test === "Corr\xE9lation de Pearson" || test === "Corr\xE9lation de Spearman") {
        const nx = normalityHint(numericValues(dataset.rows, xId));
        const ny = normalityHint(numericValues(dataset.rows, yId));
        return [
          { label: "Nature quantitative des deux variables", status: "ok", detail: "Confirm\xE9e par la d\xE9tection automatique des types" },
          { label: `Asym\xE9trie de ${xId}`, status: Math.abs(nx.skew) < 1 ? "ok" : "warn", detail: `Coefficient d'asym\xE9trie = ${nx.skew.toFixed(2)}` },
          { label: `Asym\xE9trie de ${yId}`, status: Math.abs(ny.skew) < 1 ? "ok" : "warn", detail: `Coefficient d'asym\xE9trie = ${ny.skew.toFixed(2)}` }
        ];
      }
      if (test === "ANOVA \xE0 un facteur" || test === "Test de Student") {
        const lev = leveneTest(dataset.rows, quantCol, qualCol);
        const groupSizes = lev.groupStats.map((g) => `${g.groupe} (n=${g.n})`).join(", ");
        const minN = Math.min(...lev.groupStats.map((g) => g.n));
        return [
          { label: "Homog\xE9n\xE9it\xE9 des variances (test de Levene, calcul\xE9)", status: lev.p >= 0.05 ? "ok" : "warn", detail: `F(${lev.dfBetween},${lev.dfWithin}) = ${lev.F.toFixed(2)}, p = ${lev.p < 1e-3 ? "< 0,001" : lev.p.toFixed(3)}` },
          { label: "Taille d'\xE9chantillon par groupe", status: minN >= 30 ? "ok" : "warn", detail: groupSizes }
        ];
      }
      if (test === "Test de Kruskal-Wallis" || test === "Test de Mann-Whitney") {
        const groups = {};
        dataset.rows.forEach((r) => {
          const g = String(r[qualCol] ?? "").trim();
          if (g) groups[g] = (groups[g] || 0) + 1;
        });
        return [
          { label: "Ind\xE9pendance des observations", status: "ok", detail: "Un enregistrement par unit\xE9 d'observation" },
          { label: "Taille d'\xE9chantillon par groupe", status: "ok", detail: Object.entries(groups).map(([g, n]) => `${g} (n=${n})`).join(", ") }
        ];
      }
      if (test === "Test du Khi\xB2 d'ind\xE9pendance" || test === "V de Cram\xE9r (mesure d'association)") {
        const c = chiSquareTest(dataset.rows, xId, yId);
        return [
          { label: "Effectifs th\xE9oriques \u2265 5", status: c.pctCellsBelow5 <= 20 ? "ok" : "warn", detail: `${(100 - c.pctCellsBelow5).toFixed(0)} % des cellules conformes` },
          { label: "Ind\xE9pendance des observations", status: "ok", detail: `n = ${c.n}` }
        ];
      }
    } catch (e) {
      return [{ label: "Erreur de calcul des conditions", status: "warn", detail: e.message }];
    }
  }
  const table = {
    "Corr\xE9lation de Pearson": [
      { label: "Lin\xE9arit\xE9 de la relation entre les deux variables", status: "ok", detail: "V\xE9rifi\xE9e par inspection du nuage de points" },
      { label: "Normalit\xE9 bivari\xE9e (Shapiro-Wilk conjoint)", status: "ok", detail: "p = 0,184 \u2014 non significatif" },
      { label: "Absence de valeurs aberrantes influentes", status: "warn", detail: "2 valeurs atypiques d\xE9tect\xE9es, \xE0 examiner" }
    ],
    "Corr\xE9lation de Spearman": [
      { label: "Relation monotone entre les deux variables", status: "ok", detail: "Confirm\xE9e graphiquement" },
      { label: "Absence d'ex-aequo excessifs", status: "ok" }
    ],
    "Test de Student": [
      { label: "Normalit\xE9 par groupe (Shapiro-Wilk)", status: "ok", detail: "p = 0,21 et p = 0,17" },
      { label: "Homog\xE9n\xE9it\xE9 des variances (test de Levene)", status: "ok", detail: "p = 0,312" },
      { label: "Taille d'\xE9chantillon suffisante par groupe (n \u2265 30)", status: "ok", detail: "n = 42 / n = 38" }
    ],
    "Test de Mann-Whitney": [
      { label: "Ind\xE9pendance des observations", status: "ok" },
      { label: "Distributions de forme comparable entre les deux groupes", status: "warn", detail: "Asym\xE9trie mod\xE9r\xE9e du groupe 2" }
    ],
    "ANOVA \xE0 un facteur": [
      { label: "Normalit\xE9 des r\xE9sidus (Shapiro-Wilk)", status: "warn", detail: "p = 0,041 \u2014 \xE9cart \xE0 la normalit\xE9" },
      { label: "Homog\xE9n\xE9it\xE9 des variances (test de Levene)", status: "ok", detail: "p = 0,312" },
      { label: "Taille d'\xE9chantillon suffisante par groupe (n \u2265 30)", status: "ok", detail: "n = 42" }
    ],
    "Test de Kruskal-Wallis": [
      { label: "Ind\xE9pendance des observations", status: "ok" },
      { label: "Distributions de forme comparable entre les groupes", status: "ok" }
    ],
    "Test du Khi\xB2 d'ind\xE9pendance": [
      { label: "Effectifs th\xE9oriques \u2265 5 dans au moins 80 % des cellules", status: "ok", detail: "92 % des cellules conformes" },
      { label: "Ind\xE9pendance des observations", status: "ok" }
    ],
    "V de Cram\xE9r (mesure d'association)": [
      { label: "Effectifs th\xE9oriques suffisants", status: "ok" }
    ]
  };
  return table[test] || [{ label: "Ind\xE9pendance des observations", status: "ok" }];
}
var STATUS_STYLE = {
  ok: { icon: CircleCheck, color: GREEN, bg: GREEN_TINT, text: "Conforme" },
  warn: { icon: TriangleAlert, color: AMBER, bg: AMBER_TINT, text: "\xC0 examiner" },
  fail: { icon: CircleX, color: "#B3413A", bg: "#FBE7E5", text: "Non conforme" }
};
function Watermark() {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center" }, /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "font-serif font-black whitespace-nowrap select-none",
      style: { color: NAVY, opacity: 0.06, fontSize: "13vw", letterSpacing: "-0.02em" }
    },
    "AgriHakStat"
  ), /* @__PURE__ */ import_react.default.createElement("span", { className: "absolute bottom-4 right-6 text-xs font-medium select-none", style: { color: NAVY, opacity: 0.35 } }, "Con\xE7u par Hakibou MOUSSA"));
}
function Card({ children, className = "" }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}` }, children);
}
function TabButton({ label, icon: Icon, active, onClick }) {
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick,
      className: "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
      style: active ? { background: NAVY, color: "white" } : { background: "white", color: "#5A6478", border: "1px solid #E4E6ED" }
    },
    /* @__PURE__ */ import_react.default.createElement(Icon, { size: 15 }),
    " ",
    label
  );
}
function Select({ value, onChange, options, placeholder }) {
  return /* @__PURE__ */ import_react.default.createElement(
    "select",
    {
      value: value || "",
      onChange: (e) => onChange(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2 bg-white",
      style: { "--tw-ring-color": GOLD }
    },
    /* @__PURE__ */ import_react.default.createElement("option", { value: "", disabled: true }, placeholder),
    options.map((v) => /* @__PURE__ */ import_react.default.createElement("option", { key: v.id, value: v.id }, v.label))
  );
}
function AnalysisConfig({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin, dataset, analysisQueue, onAnalysisQueueChange, context, univariateQueue, onUnivariateQueueChange }) {
  const [suggestions, setSuggestions] = (0, import_react.useState)([]);
  const [suggestLoading, setSuggestLoading] = (0, import_react.useState)(false);
  const [suggestError, setSuggestError] = (0, import_react.useState)("");
  const [tab, setTab] = (0, import_react.useState)("bivariee");
  const [included, setIncluded] = (0, import_react.useState)(["sup_semee", "rendement", "filiere", "commune", "pluvio_decade", "acces_credit"]);
  const [x, setX] = (0, import_react.useState)("sup_semee");
  const [y, setY] = (0, import_react.useState)("pluvio_decade");
  const [override, setOverride] = (0, import_react.useState)(null);
  const [confirmed, setConfirmed] = (0, import_react.useState)({});
  const [selectedXs, setSelectedXs] = (0, import_react.useState)([]);
  const queue = analysisQueue || [];
  const setQueue = onAnalysisQueueChange || (() => {
  });
  const uniQueue = univariateQueue || [];
  const setUniQueue = onUnivariateQueueChange || (() => {
  });
  const variables = (0, import_react.useMemo)(
    () => dataset ? dataset.columns.filter((c) => c.type !== "Vide" && c.type !== "Texte libre").map((c) => ({
      id: c.name,
      label: c.name,
      type: c.type,
      isQuantitative: c.isQuantitative,
      modalites: c.modalites
    })) : VARIABLES,
    [dataset]
  );
  (0, import_react.useEffect)(() => {
    if (dataset) {
      const ids = variables.map((v) => v.id);
      setIncluded(ids);
      const quant = variables.filter((v) => v.isQuantitative);
      const qual = variables.filter((v) => !v.isQuantitative);
      setX((quant[0] || variables[0])?.id);
      setY((qual[0] || variables[1] || variables[0])?.id);
    }
  }, [dataset]);
  const availableVars = variables.filter((v) => included.includes(v.id));
  const toggleIncluded = (id) => setIncluded((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  const fetchSuggestions = async () => {
    if (!dataset) return;
    setSuggestLoading(true);
    setSuggestError("");
    try {
      const res = await fetch("/api/suggest-analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          columns: availableVars.map((v) => ({ name: v.id, isQuantitative: v.isQuantitative, type: v.type }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue.");
      setSuggestions(data.suggestions || []);
    } catch (e) {
      setSuggestError(e.message);
    } finally {
      setSuggestLoading(false);
    }
  };
  const applySuggestion = (s) => {
    setTab("bivariee");
    setX(s.xId);
    setY(s.yId);
    setOverride(null);
    setSuggestions((prev) => prev.filter((sg) => sg !== s));
  };
  const proposal = (0, import_react.useMemo)(() => proposeTest(x, y, variables, dataset), [x, y, variables, dataset]);
  const activeTest = override || proposal?.test;
  const xVar = variables.find((v) => v.id === x);
  const yVar = variables.find((v) => v.id === y);
  const conditions = (0, import_react.useMemo)(
    () => activeTest ? getConditions(activeTest, { dataset, xId: x, yId: y }) : [],
    [activeTest, dataset, x, y]
  );
  const allConfirmed = conditions.length > 0 && conditions.every((_, i) => confirmed[i]);
  const realStat = (0, import_react.useMemo)(
    () => activeTest ? computeRealStat(activeTest, x, y, dataset) : null,
    [activeTest, x, y, dataset]
  );
  (0, import_react.useEffect)(() => {
    setConfirmed({});
  }, [activeTest, x, y]);
  (0, import_react.useEffect)(() => {
    setSelectedXs([]);
  }, [y, dataset]);
  const addToQueue = () => {
    if (!proposal) return;
    setQueue([
      ...queue,
      {
        id: Date.now(),
        label: `${xVar.label} \xD7 ${yVar.label}`,
        xId: x,
        yId: y,
        xLabel: xVar.label,
        yLabel: yVar.label,
        test: activeTest,
        status: override ? "adjusted" : "auto",
        conditionsCount: conditions.length,
        conditionsConfirmedCount: conditions.filter((_, i) => confirmed[i]).length,
        detail: realStat?.detail,
        p: realStat?.p
      }
    ]);
    setOverride(null);
    setConfirmed({});
  };
  const toggleSelectedX = (id) => setSelectedXs((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  const addBatchToQueue = () => {
    if (!yVar || selectedXs.length === 0) return;
    const newItems = selectedXs.map((xId) => {
      const xv = variables.find((v) => v.id === xId);
      if (!xv) return null;
      const prop = proposeTest(xId, y, variables, dataset);
      if (!prop) return null;
      const stat = computeRealStat(prop.test, xId, y, dataset);
      const cond = getConditions(prop.test, { dataset, xId, yId: y });
      return {
        id: Date.now() + Math.random(),
        label: `${xv.label} \xD7 ${yVar.label}`,
        xId,
        yId: y,
        xLabel: xv.label,
        yLabel: yVar.label,
        test: prop.test,
        status: "auto",
        conditionsCount: cond.length,
        conditionsConfirmedCount: 0,
        detail: stat?.detail,
        p: stat?.p
      };
    }).filter(Boolean);
    setQueue([...queue, ...newItems]);
    setSelectedXs([]);
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans" }, /* @__PURE__ */ import_react.default.createElement(Watermark, null), /* @__PURE__ */ import_react.default.createElement("div", { className: "relative z-10 flex" }, /* @__PURE__ */ import_react.default.createElement(Sidebar, { active, onNavigate }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 min-h-screen" }, /* @__PURE__ */ import_react.default.createElement(
    "header",
    {
      className: "bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between",
      style: { borderBottom: `2px solid ${GOLD}` }
    },
    /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", { className: "font-serif text-xl font-bold", style: { color: NAVY } }, "Configuration des analyses"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-500 mt-0.5" }, dataset ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, "Donn\xE9es r\xE9elles : ", /* @__PURE__ */ import_react.default.createElement("span", { className: "font-medium", style: { color: "#256B45" } }, dataset.fileName), " (", dataset.rows.length, " lignes)") : "Aucun fichier import\xE9 \u2014 exemple illustratif (Suivi semis 2026-2027)")),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ import_react.default.createElement(Bell, { size: 18, className: "text-gray-400" }), /* @__PURE__ */ import_react.default.createElement(
      UserMenu,
      {
        email: userEmail,
        roleLabel,
        isAdmin,
        isGuest,
        onLogout,
        onOpenAdmin
      }
    ))
  ), /* @__PURE__ */ import_react.default.createElement("main", { className: "p-8 grid grid-cols-3 gap-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "col-span-2" }, /* @__PURE__ */ import_react.default.createElement(Card, { className: "mb-5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ import_react.default.createElement(ShieldCheck, { size: 16, style: { color: NAVY } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Variables retenues pour cette session")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-3" }, dataset ? `Variables d\xE9tect\xE9es dans ${dataset.fileName}. Seules celles coch\xE9es seront propos\xE9es dans les analyses ci-dessous.` : "Seules les variables coch\xE9es seront propos\xE9es dans les analyses ci-dessous (exemple illustratif \u2014 importez un fichier pour vos propres variables)."), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-2" }, variables.map((v) => /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      key: v.id,
      onClick: () => toggleIncluded(v.id),
      className: "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
      style: included.includes(v.id) ? { background: NAVY_TINT, borderColor: NAVY, color: NAVY } : { background: "white", borderColor: "#D8DEE9", color: "#B0B7C6" }
    },
    included.includes(v.id) ? /* @__PURE__ */ import_react.default.createElement(Check, { size: 11, className: "inline mr-1 -mt-0.5" }) : null,
    v.label
  )))), /* @__PURE__ */ import_react.default.createElement(Card, { className: "mb-5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(WandSparkles, { size: 16, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Suggestions de Claude")), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: fetchSuggestions,
      disabled: !dataset || suggestLoading,
      className: "text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white disabled:opacity-50",
      style: { background: NAVY }
    },
    /* @__PURE__ */ import_react.default.createElement(WandSparkles, { size: 12 }),
    " ",
    suggestLoading ? "Analyse en cours\u2026" : "Proposer des analyses"
  )), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-3" }, dataset ? "Claude examine vos variables et le contexte de l'\xE9tude pour proposer des croisements pertinents \u2014 chaque suggestion reste \xE0 valider avant tout calcul." : "Importez d'abord une base de donn\xE9es pour activer les suggestions."), suggestError && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl px-3 py-2 mb-2 text-xs", style: { background: "#FBE7E5", color: "#B3413A" } }, suggestError), suggestions.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2" }, suggestions.map((s, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i, className: "rounded-xl border border-gray-100 p-3 flex items-start justify-between gap-3", style: { background: "#FDF9F0" } }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-semibold", style: { color: NAVY } }, s.xId, " \xD7 ", s.yId), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-500 mt-0.5" }, s.rationale)), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => applySuggestion(s),
      className: "shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-lg text-white whitespace-nowrap",
      style: { background: "#256B45" }
    },
    "Configurer cette analyse"
  ))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex gap-2 mb-5" }, /* @__PURE__ */ import_react.default.createElement(TabButton, { label: "Univari\xE9e", icon: Sigma, active: tab === "univariee", onClick: () => setTab("univariee") }), /* @__PURE__ */ import_react.default.createElement(TabButton, { label: "Bivari\xE9e", icon: TrendingUp, active: tab === "bivariee", onClick: () => setTab("bivariee") }), /* @__PURE__ */ import_react.default.createElement(TabButton, { label: "Multivari\xE9e", icon: Layers, active: tab === "multivariee", onClick: () => setTab("multivariee") })), tab === "bivariee" && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "Analyse bivari\xE9e"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, "S\xE9lectionnez deux variables : le test statistique adapt\xE9 est propos\xE9 automatiquement."), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-4 mb-4" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Variable X (aper\xE7u d\xE9taill\xE9)"), /* @__PURE__ */ import_react.default.createElement(Select, { value: x, onChange: (v) => {
    setX(v);
    setOverride(null);
  }, options: availableVars, placeholder: "Choisir une variable" }), xVar && /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-400 mt-1" }, xVar.type)), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Variable Y (fixe pour le lancement group\xE9)"), /* @__PURE__ */ import_react.default.createElement(Select, { value: y, onChange: (v) => {
    setY(v);
    setOverride(null);
  }, options: availableVars, placeholder: "Choisir une variable" }), yVar && /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-400 mt-1" }, yVar.type))), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-2xl p-4 border border-gray-100 mb-5", style: { background: "#FAFBFD" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(Layers, { size: 14, style: { color: NAVY } }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-xs font-semibold", style: { color: NAVY } }, "S\xE9lection multiple de X \u2014 lancement group\xE9 face \xE0 ", yVar ? yVar.label : "Y")), selectedXs.length > 0 && /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: addBatchToQueue,
      className: "text-[11px] font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white",
      style: { background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }
    },
    /* @__PURE__ */ import_react.default.createElement(Plus, { size: 12 }),
    " Ajouter les ",
    selectedXs.length,
    " tableau",
    selectedXs.length > 1 ? "x" : "",
    " \xE0 la file"
  )), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-[11px] text-gray-400 mb-2" }, "Cochez plusieurs variables X pour calculer et ajouter simultan\xE9ment un tableau crois\xE9 avec ", yVar ? yVar.label : "la variable Y choisie", " pour chacune \u2014 sans repasser par la confirmation individuelle des conditions."), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-2" }, availableVars.filter((v) => v.id !== y).map((v) => /* @__PURE__ */ import_react.default.createElement(
    "label",
    {
      key: v.id,
      className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border cursor-pointer",
      style: selectedXs.includes(v.id) ? { background: NAVY_TINT, borderColor: NAVY, color: NAVY } : { background: "white", borderColor: "#D8DEE9", color: "#5A6478" }
    },
    /* @__PURE__ */ import_react.default.createElement("input", { type: "checkbox", className: "w-3 h-3", checked: selectedXs.includes(v.id), onChange: () => toggleSelectedX(v.id), style: { accentColor: NAVY } }),
    v.label
  )))), proposal && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-2xl p-4 border mb-4", style: { background: override ? AMBER_TINT : NAVY_TINT, borderColor: "transparent" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(WandSparkles, { size: 15, style: { color: override ? AMBER : NAVY } }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm font-semibold", style: { color: override ? AMBER : NAVY } }, activeTest)), /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "text-[11px] font-medium px-2 py-1 rounded-full",
      style: { background: "white", color: override ? AMBER : NAVY }
    },
    override ? "Ajust\xE9 par l'analyste" : "Propos\xE9 automatiquement"
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-1.5 text-xs mb-3", style: { color: override ? AMBER : "#3A5488" } }, /* @__PURE__ */ import_react.default.createElement(Info, { size: 13, className: "mt-0.5 shrink-0" }), /* @__PURE__ */ import_react.default.createElement("span", null, proposal.justification)), realStat && !realStat.error && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl bg-white/70 px-3 py-2 mb-3 text-xs font-mono", style: { color: NAVY } }, "R\xE9sultat calcul\xE9 sur les donn\xE9es import\xE9es : ", realStat.detail), realStat?.error && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl bg-white/70 px-3 py-2 mb-3 text-xs", style: { color: "#B3413A" } }, "Calcul impossible : ", realStat.error), !dataset && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl bg-white/70 px-3 py-2 mb-3 text-xs text-gray-400 italic" }, "Aucun fichier import\xE9 \u2014 importez une base \xE0 l'\xE9tape \xAB Assistant d'import \xBB pour un calcul r\xE9el."), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(Pencil, { size: 13, className: "text-gray-400" }), /* @__PURE__ */ import_react.default.createElement(
    "select",
    {
      value: activeTest,
      onChange: (e) => setOverride(e.target.value === proposal.test ? null : e.target.value),
      className: "text-xs rounded-lg border border-gray-200 p-1.5 bg-white focus:outline-none"
    },
    proposal.alternatives.map((a) => /* @__PURE__ */ import_react.default.createElement("option", { key: a, value: a }, a))
  ), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-400" }, "Ajuster le test si n\xE9cessaire"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-2xl p-4 border border-gray-100" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-3" }, /* @__PURE__ */ import_react.default.createElement(ShieldCheck, { size: 15, style: { color: NAVY } }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm font-semibold", style: { color: NAVY } }, "Conditions de validation du test")), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2" }, conditions.map((c, i) => {
    const s = STATUS_STYLE[c.status];
    const Icon = s.icon;
    return /* @__PURE__ */ import_react.default.createElement("label", { key: i, className: "flex items-start gap-3 rounded-xl p-2.5 cursor-pointer", style: { background: s.bg } }, /* @__PURE__ */ import_react.default.createElement(
      "input",
      {
        type: "checkbox",
        checked: !!confirmed[i],
        onChange: (e) => setConfirmed({ ...confirmed, [i]: e.target.checked }),
        className: "w-4 h-4 rounded mt-0.5",
        style: { accentColor: s.color }
      }
    ), /* @__PURE__ */ import_react.default.createElement(Icon, { size: 15, style: { color: s.color }, className: "mt-0.5 shrink-0" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-medium", style: { color: s.color } }, c.label), c.detail && /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-500 mt-0.5" }, c.detail)), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[10px] font-semibold shrink-0", style: { color: s.color } }, s.text));
  })), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-[11px] text-gray-400 mt-3" }, "La confirmation des conditions est facultative et sert de tra\xE7abilit\xE9 m\xE9thodologique \u2014 elle n'est plus requise pour poursuivre le traitement.", conditions.length > 0 && /* @__PURE__ */ import_react.default.createElement("span", { className: "ml-1 font-medium", style: { color: allConfirmed ? GREEN : "#B0B7C6" } }, "(", conditions.filter((_, i) => confirmed[i]).length, "/", conditions.length, " confirm\xE9e", conditions.filter((_, i) => confirmed[i]).length > 1 ? "s" : "", ")")))), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: addToQueue,
      disabled: !proposal,
      className: "mt-5 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed",
      style: { background: proposal ? `linear-gradient(135deg, ${NAVY}, #2A4A82)` : "#B0B7C6" }
    },
    /* @__PURE__ */ import_react.default.createElement(Plus, { size: 15 }),
    " Ajouter \xE0 la file d'analyses"
  )), tab === "univariee" && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "Analyse univari\xE9e"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, dataset ? "Statistiques calcul\xE9es r\xE9ellement \xE0 partir du fichier import\xE9. Validez chaque variable pour qu'elle soit reprise dans les r\xE9sultats et le rapport." : "Importez un fichier pour calculer les statistiques r\xE9elles et valider les variables \xE0 inclure dans le rapport."), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2" }, availableVars.map((v) => {
    let real = null;
    if (dataset) {
      try {
        real = v.isQuantitative ? descriptiveStats(dataset.rows, v.id) : frequencies(dataset.rows, v.id).slice(0, 3);
      } catch (e) {
        real = null;
      }
    }
    const isValidated = uniQueue.some((u) => u.variableId === v.id);
    const toggleValidated = () => {
      if (!real) return;
      if (isValidated) {
        setUniQueue(uniQueue.filter((u) => u.variableId !== v.id));
      } else {
        setUniQueue([
          ...uniQueue,
          { id: Date.now() + Math.random(), variableId: v.id, variableLabel: v.label, isQuantitative: v.isQuantitative, stats: real }
        ]);
      }
    };
    const outliers = real && v.isQuantitative ? real.outliers : null;
    return /* @__PURE__ */ import_react.default.createElement("div", { key: v.id, className: "rounded-xl border border-gray-100 p-3" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "flex items-center gap-3 cursor-pointer" }, /* @__PURE__ */ import_react.default.createElement(
      "input",
      {
        type: "checkbox",
        checked: isValidated,
        onChange: toggleValidated,
        disabled: !real,
        className: "w-4 h-4 rounded disabled:opacity-40",
        style: { accentColor: GREEN }
      }
    ), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm text-gray-800" }, v.label)), isValidated ? /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full", style: { background: GREEN_TINT, color: GREEN } }, "Valid\xE9e pour le rapport") : !dataset ? /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-400" }, v.isQuantitative ? "Moyenne, m\xE9diane, \xE9cart-type, min/max" : "Fr\xE9quences, mode") : /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-400" }, "\xC0 valider")), real && v.isQuantitative && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-2 mt-2 text-center" }, [["Moyenne", real.moyenne], ["M\xE9diane", real.mediane], ["\xC9cart-type", real.ecartType], ["CV (%)", real.cv], ["Min", real.min], ["Max", real.max]].map(([l, val]) => /* @__PURE__ */ import_react.default.createElement("div", { key: l, className: "rounded-lg py-1.5", style: { background: NAVY_TINT } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[10px] text-gray-500" }, l), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-bold", style: { color: NAVY } }, val.toFixed(2))))), outliers && outliers.count !== null && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-[11px] mt-2", style: { color: outliers.count > 0 ? AMBER : "#9CA3AF" } }, outliers.count > 0 ? `${outliers.count} valeur${outliers.count > 1 ? "s" : ""} atypique${outliers.count > 1 ? "s" : ""} d\xE9tect\xE9e${outliers.count > 1 ? "s" : ""} (m\xE9thode interquartile) \u2014 hors de l'intervalle [${outliers.lowerBound.toFixed(1)} ; ${outliers.upperBound.toFixed(1)}] (Q1=${outliers.q1.toFixed(1)}, Q3=${outliers.q3.toFixed(1)}, IQR=${outliers.iqr.toFixed(1)})` : "Aucune valeur atypique d\xE9tect\xE9e (m\xE9thode interquartile).")), real && !v.isQuantitative && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-1.5 mt-2" }, real.map((f) => /* @__PURE__ */ import_react.default.createElement("span", { key: f.modalite, className: "text-[10px] px-2 py-1 rounded-full", style: { background: NAVY_TINT, color: NAVY } }, f.modalite, " \xB7 ", f.pct.toFixed(0), "% (n=", f.n, ")"))));
  }))), tab === "multivariee" && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "Analyse multivari\xE9e"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, "Choisissez la m\xE9thode, puis les variables \xE0 inclure."), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 mb-4 text-xs", style: { background: AMBER_TINT, color: AMBER } }, "Les m\xE9thodes multivari\xE9es (ACP, AFC, CAH, r\xE9gression) n\xE9cessitent le moteur de calcul R d\xE9crit dans l'architecture technique \u2014 non encore branch\xE9 \xE0 cette maquette. L'\xE9cran ci-dessous reste illustratif."), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-3 mb-5" }, ["ACP", "AFC", "Classification (CAH)", "R\xE9gression multiple"].map((m, i) => /* @__PURE__ */ import_react.default.createElement(
    "label",
    {
      key: m,
      className: `flex items-center gap-2 rounded-xl border p-3 cursor-pointer text-sm ${i === 3 ? "border-2" : "border-gray-100"}`,
      style: i === 3 ? { borderColor: GOLD, background: "#FDF9F0" } : {}
    },
    /* @__PURE__ */ import_react.default.createElement("input", { type: "radio", name: "method", defaultChecked: i === 3, style: { accentColor: NAVY } }),
    m
  ))), /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Variable d\xE9pendante"), /* @__PURE__ */ import_react.default.createElement(Select, { value: "rendement", onChange: () => {
  }, options: availableVars, placeholder: "Choisir" }), /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5 mt-4" }, "Variables explicatives"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-2 mb-4" }, ["Superficie sem\xE9e", "Pluviom\xE9trie d\xE9cadaire", "Acc\xE8s au cr\xE9dit", "Satisfaction intrants"].map((v) => /* @__PURE__ */ import_react.default.createElement("span", { key: v, className: "text-xs px-3 py-1.5 rounded-full font-medium", style: { background: NAVY_TINT, color: NAVY } }, v))), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-2xl p-4 border border-gray-100" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ import_react.default.createElement(ShieldCheck, { size: 15, style: { color: NAVY } }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm font-semibold", style: { color: NAVY } }, "Conditions de validation du mod\xE8le")), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2" }, [
    { label: "Absence de multicolin\xE9arit\xE9 (VIF < 5 pour chaque variable explicative)", status: "ok", detail: "VIF max = 2,1" },
    { label: "Normalit\xE9 des r\xE9sidus (Shapiro-Wilk)", status: "ok", detail: "p = 0,22" },
    { label: "Homosc\xE9dasticit\xE9 des r\xE9sidus", status: "warn", detail: "Tendance l\xE9g\xE8re \xE0 examiner" }
  ].map((c, i) => {
    const s = STATUS_STYLE[c.status];
    const Icon = s.icon;
    return /* @__PURE__ */ import_react.default.createElement("label", { key: i, className: "flex items-start gap-3 rounded-xl p-2.5 cursor-pointer", style: { background: s.bg } }, /* @__PURE__ */ import_react.default.createElement("input", { type: "checkbox", className: "w-4 h-4 rounded mt-0.5", style: { accentColor: s.color } }), /* @__PURE__ */ import_react.default.createElement(Icon, { size: 15, style: { color: s.color }, className: "mt-0.5 shrink-0" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-medium", style: { color: s.color } }, c.label), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-500 mt-0.5" }, c.detail)), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[10px] font-semibold shrink-0", style: { color: s.color } }, s.text));
  }))))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "File d'analyses configur\xE9es"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-4" }, queue.length, " analyse", queue.length > 1 ? "s" : "", " pr\xEAte", queue.length > 1 ? "s" : "", " \xE0 ex\xE9cuter"), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2 mb-5" }, queue.map((item, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i, className: "flex items-start gap-2 rounded-xl border border-gray-100 p-3" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-medium text-gray-800" }, item.label), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-500 mt-0.5" }, item.test), item.detail && /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[10px] font-mono text-gray-400 mt-0.5" }, item.detail), /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1",
      style: item.status === "adjusted" ? { background: AMBER_TINT, color: AMBER } : { background: GREEN_TINT, color: GREEN }
    },
    item.status === "adjusted" ? /* @__PURE__ */ import_react.default.createElement(Pencil, { size: 9 }) : /* @__PURE__ */ import_react.default.createElement(Check, { size: 9 }),
    item.status === "adjusted" ? "Ajust\xE9" : "Auto",
    " \xB7 ",
    item.conditionsCount,
    " condition",
    item.conditionsCount > 1 ? "s" : "",
    " valid\xE9e",
    item.conditionsCount > 1 ? "s" : ""
  )), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setQueue(queue.filter((_, idx) => idx !== i)), className: "text-gray-300 hover:text-red-400" }, /* @__PURE__ */ import_react.default.createElement(X, { size: 14 })))), queue.length === 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400 italic" }, "Aucune analyse ajout\xE9e pour l'instant.")), uniQueue.length > 0 && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-[11px] text-gray-400 mb-2" }, uniQueue.length, " variable", uniQueue.length > 1 ? "s" : "", " univari\xE9e", uniQueue.length > 1 ? "s" : "", " valid\xE9e", uniQueue.length > 1 ? "s" : "", " pour le rapport."), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => onNavigate("results"),
      disabled: queue.length === 0 && uniQueue.length === 0,
      className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed",
      style: { background: `linear-gradient(135deg, #3E9C6B, ${GREEN})` }
    },
    /* @__PURE__ */ import_react.default.createElement(Play, { size: 14 }),
    " Lancer les analyses"
  )))))));
}
export {
  AnalysisConfig as default
};
