import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, Wand2, Pencil, Plus, X, Play, Check, Info,
  TrendingUp, Layers, Sigma, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, MapPin, Star,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import Sidebar from "./Sidebar.jsx";
import {
  descriptiveStats, frequencies, numericValues, normalityHint,
  pearsonCorrelation, spearmanCorrelation, oneWayAnova, leveneTest,
  chiSquareTest, mannWhitneyU, kruskalWallis,
} from "./realStats.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";
const GREEN_TINT = "#E4F5EC";
const AMBER = "#8A5A00";
const AMBER_TINT = "#FDF1DA";
const NAVY_TINT = "#EBEEF7";

const nav = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: BarChart3 },
  { id: "results", label: "Résultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
];

const VARIABLES = [
  { id: "sup_semee", label: "Superficie semée (ha)", type: "Quantitative continue", isQuantitative: true, normal: false },
  { id: "rendement", label: "Rendement estimé (kg/ha)", type: "Quantitative continue", isQuantitative: true, normal: true },
  { id: "filiere", label: "Filière suivie", type: "Nominale (5 modalités)", isQuantitative: false },
  { id: "commune", label: "Commune d'enquête", type: "Nominale (8 modalités)", isQuantitative: false },
  { id: "satisf_intrants", label: "Satisfaction intrants", type: "Ordinale (4 niveaux)", isQuantitative: false },
  { id: "acces_credit", label: "Accès au crédit agricole", type: "Nominale (2 modalités)", isQuantitative: false },
  { id: "pluvio_decade", label: "Pluviométrie décadaire (mm)", type: "Quantitative continue", isQuantitative: true, normal: true },
];

// Détermine si une variable quantitative "suit" une loi normale (indicatif, via asymétrie)
// à partir des données réellement importées ; retombe sur le drapeau statique en mode démonstration.
function isNormal(variable, dataset) {
  if (!dataset) return variable.normal;
  const vals = numericValues(dataset.rows, variable.id);
  if (vals.length < 5) return true;
  return normalityHint(vals).looksNormal;
}

// Simple deterministic "proposed test" logic, alimentée par les vraies données quand un fichier est importé
function proposeTest(xId, yId, variables, dataset) {
  const x = variables.find((v) => v.id === xId);
  const y = variables.find((v) => v.id === yId);
  if (!x || !y) return null;
  const isQuantX = x.isQuantitative;
  const isQuantY = y.isQuantitative;

  if (isQuantX && isQuantY) {
    const normal = isNormal(x, dataset) && isNormal(y, dataset);
    return {
      test: normal ? "Corrélation de Pearson" : "Corrélation de Spearman",
      justification: normal
        ? "Les deux variables suivent une distribution approximativement normale (asymétrie modérée) : le coefficient de corrélation de Pearson est adapté."
        : "Au moins une variable s'écarte de la normalité (asymétrie marquée) : le coefficient de corrélation de Spearman, non paramétrique, est privilégié.",
      alternatives: ["Corrélation de Pearson", "Corrélation de Spearman"],
    };
  }
  if (isQuantX !== isQuantY) {
    const quant = isQuantX ? x : y;
    const qual = isQuantX ? y : x;
    const nModalites = qual.modalites ? qual.modalites.length : (qual.type.includes("2 modalités") ? 2 : 3);
    const modalites = nModalites === 2;
    const normal = isNormal(quant, dataset);
    return {
      test: modalites ? (normal ? "Test de Student" : "Test de Mann-Whitney") : (normal ? "ANOVA à un facteur" : "Test de Kruskal-Wallis"),
      justification: `Variable qualitative à ${modalites ? "deux" : "plusieurs"} modalités croisée avec une variable quantitative ${normal ? "approximativement normale" : "s'écartant de la normalité (asymétrie marquée)"}.`,
      alternatives: modalites
        ? ["Test de Student", "Test de Mann-Whitney"]
        : ["ANOVA à un facteur", "Test de Kruskal-Wallis"],
    };
  }
  return {
    test: "Test du Khi² d'indépendance",
    justification: "Deux variables qualitatives : le test du Khi² évalue l'indépendance, complété par le V de Cramér pour la force de l'association.",
    alternatives: ["Test du Khi² d'indépendance", "V de Cramér (mesure d'association)"],
  };
}

// Calcule le résultat réel du test choisi à partir des données importées
function computeRealStat(testName, xId, yId, dataset) {
  if (!dataset) return null;
  try {
    switch (testName) {
      case "Corrélation de Pearson": {
        const r = pearsonCorrelation(dataset.rows, xId, yId);
        return { statLabel: "r", statValue: r.r, p: r.p, n: r.n, detail: `r = ${r.r.toFixed(3)}, n = ${r.n}, p = ${r.p < 0.001 ? "< 0,001" : r.p.toFixed(3)}` };
      }
      case "Corrélation de Spearman": {
        const r = spearmanCorrelation(dataset.rows, xId, yId);
        return { statLabel: "ρ", statValue: r.r, p: r.p, n: r.n, detail: `ρ = ${r.r.toFixed(3)}, n = ${r.n}, p = ${r.p < 0.001 ? "< 0,001" : r.p.toFixed(3)}` };
      }
      case "ANOVA à un facteur": {
        const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
        const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];
        const a = oneWayAnova(dataset.rows, quantCol, qualCol);
        return { statLabel: "F", statValue: a.F, p: a.p, n: a.N, detail: `F(${a.dfBetween},${a.dfWithin}) = ${a.F.toFixed(2)}, p = ${a.p < 0.001 ? "< 0,001" : a.p.toFixed(3)}, η² = ${a.etaSq.toFixed(2)}`, raw: a };
      }
      case "Test de Kruskal-Wallis": {
        const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
        const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];
        const k = kruskalWallis(dataset.rows, quantCol, qualCol);
        return { statLabel: "H", statValue: k.H, p: k.p, n: k.N, detail: `H(${k.df}) = ${k.H.toFixed(2)}, p = ${k.p < 0.001 ? "< 0,001" : k.p.toFixed(3)}` };
      }
      case "Test de Student":
      case "Test de Mann-Whitney": {
        const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
        const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];
        if (testName === "Test de Mann-Whitney") {
          const m = mannWhitneyU(dataset.rows, quantCol, qualCol);
          return { statLabel: "U", statValue: m.U, p: m.p, n: m.n1 + m.n2, detail: `U = ${m.U.toFixed(1)}, z = ${m.z.toFixed(2)}, p = ${m.p < 0.001 ? "< 0,001" : m.p.toFixed(3)}` };
        }
        const a = oneWayAnova(dataset.rows, quantCol, qualCol);
        const t = Math.sqrt(a.F);
        return { statLabel: "t", statValue: t, p: a.p, n: a.N, detail: `t ≈ ${t.toFixed(2)}, p = ${a.p < 0.001 ? "< 0,001" : a.p.toFixed(3)}` };
      }
      case "Test du Khi² d'indépendance":
      case "V de Cramér (mesure d'association)": {
        const c = chiSquareTest(dataset.rows, xId, yId);
        return { statLabel: "χ²", statValue: c.chi2, p: c.p, n: c.n, detail: `χ²(${c.df}) = ${c.chi2.toFixed(2)}, p = ${c.p < 0.001 ? "< 0,001" : c.p.toFixed(3)}, V de Cramér = ${c.cramersV.toFixed(2)}`, raw: c };
      }
      default:
        return null;
    }
  } catch (e) {
    return { error: e.message };
  }
}


// Conditions d'application propres à chaque test — calculées réellement quand un fichier est importé,
// sinon table illustrative de démonstration. Validation explicite toujours requise par l'opérateur.
function getConditions(test, ctx) {
  const { dataset, xId, yId } = ctx || {};

  if (dataset) {
    try {
      const isXQuant = numericValues(dataset.rows, xId).length > numericValues(dataset.rows, yId).length;
      const [quantCol, qualCol] = isXQuant ? [xId, yId] : [yId, xId];

      if (test === "Corrélation de Pearson" || test === "Corrélation de Spearman") {
        const nx = normalityHint(numericValues(dataset.rows, xId));
        const ny = normalityHint(numericValues(dataset.rows, yId));
        return [
          { label: "Nature quantitative des deux variables", status: "ok", detail: "Confirmée par la détection automatique des types" },
          { label: `Asymétrie de ${xId}`, status: Math.abs(nx.skew) < 1 ? "ok" : "warn", detail: `Coefficient d'asymétrie = ${nx.skew.toFixed(2)}` },
          { label: `Asymétrie de ${yId}`, status: Math.abs(ny.skew) < 1 ? "ok" : "warn", detail: `Coefficient d'asymétrie = ${ny.skew.toFixed(2)}` },
        ];
      }
      if (test === "ANOVA à un facteur" || test === "Test de Student") {
        const lev = leveneTest(dataset.rows, quantCol, qualCol);
        const groupSizes = lev.groupStats.map((g) => `${g.groupe} (n=${g.n})`).join(", ");
        const minN = Math.min(...lev.groupStats.map((g) => g.n));
        return [
          { label: "Homogénéité des variances (test de Levene, calculé)", status: lev.p >= 0.05 ? "ok" : "warn", detail: `F(${lev.dfBetween},${lev.dfWithin}) = ${lev.F.toFixed(2)}, p = ${lev.p < 0.001 ? "< 0,001" : lev.p.toFixed(3)}` },
          { label: "Taille d'échantillon par groupe", status: minN >= 30 ? "ok" : "warn", detail: groupSizes },
        ];
      }
      if (test === "Test de Kruskal-Wallis" || test === "Test de Mann-Whitney") {
        const groups = {};
        dataset.rows.forEach((r) => {
          const g = String(r[qualCol] ?? "").trim();
          if (g) groups[g] = (groups[g] || 0) + 1;
        });
        return [
          { label: "Indépendance des observations", status: "ok", detail: "Un enregistrement par unité d'observation" },
          { label: "Taille d'échantillon par groupe", status: "ok", detail: Object.entries(groups).map(([g, n]) => `${g} (n=${n})`).join(", ") },
        ];
      }
      if (test === "Test du Khi² d'indépendance" || test === "V de Cramér (mesure d'association)") {
        const c = chiSquareTest(dataset.rows, xId, yId);
        return [
          { label: "Effectifs théoriques ≥ 5", status: c.pctCellsBelow5 <= 20 ? "ok" : "warn", detail: `${(100 - c.pctCellsBelow5).toFixed(0)} % des cellules conformes` },
          { label: "Indépendance des observations", status: "ok", detail: `n = ${c.n}` },
        ];
      }
    } catch (e) {
      return [{ label: "Erreur de calcul des conditions", status: "warn", detail: e.message }];
    }
  }

  const table = {
    "Corrélation de Pearson": [
      { label: "Linéarité de la relation entre les deux variables", status: "ok", detail: "Vérifiée par inspection du nuage de points" },
      { label: "Normalité bivariée (Shapiro-Wilk conjoint)", status: "ok", detail: "p = 0,184 — non significatif" },
      { label: "Absence de valeurs aberrantes influentes", status: "warn", detail: "2 valeurs atypiques détectées, à examiner" },
    ],
    "Corrélation de Spearman": [
      { label: "Relation monotone entre les deux variables", status: "ok", detail: "Confirmée graphiquement" },
      { label: "Absence d'ex-aequo excessifs", status: "ok" },
    ],
    "Test de Student": [
      { label: "Normalité par groupe (Shapiro-Wilk)", status: "ok", detail: "p = 0,21 et p = 0,17" },
      { label: "Homogénéité des variances (test de Levene)", status: "ok", detail: "p = 0,312" },
      { label: "Taille d'échantillon suffisante par groupe (n ≥ 30)", status: "ok", detail: "n = 42 / n = 38" },
    ],
    "Test de Mann-Whitney": [
      { label: "Indépendance des observations", status: "ok" },
      { label: "Distributions de forme comparable entre les deux groupes", status: "warn", detail: "Asymétrie modérée du groupe 2" },
    ],
    "ANOVA à un facteur": [
      { label: "Normalité des résidus (Shapiro-Wilk)", status: "warn", detail: "p = 0,041 — écart à la normalité" },
      { label: "Homogénéité des variances (test de Levene)", status: "ok", detail: "p = 0,312" },
      { label: "Taille d'échantillon suffisante par groupe (n ≥ 30)", status: "ok", detail: "n = 42" },
    ],
    "Test de Kruskal-Wallis": [
      { label: "Indépendance des observations", status: "ok" },
      { label: "Distributions de forme comparable entre les groupes", status: "ok" },
    ],
    "Test du Khi² d'indépendance": [
      { label: "Effectifs théoriques ≥ 5 dans au moins 80 % des cellules", status: "ok", detail: "92 % des cellules conformes" },
      { label: "Indépendance des observations", status: "ok" },
    ],
    "V de Cramér (mesure d'association)": [
      { label: "Effectifs théoriques suffisants", status: "ok" },
    ],
  };
  return table[test] || [{ label: "Indépendance des observations", status: "ok" }];
}

const STATUS_STYLE = {
  ok: { icon: CheckCircle2, color: GREEN, bg: GREEN_TINT, text: "Conforme" },
  warn: { icon: AlertTriangle, color: AMBER, bg: AMBER_TINT, text: "À examiner" },
  fail: { icon: XCircle, color: "#B3413A", bg: "#FBE7E5", text: "Non conforme" },
};

function Watermark() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
      <span className="font-serif font-black whitespace-nowrap select-none"
        style={{ color: NAVY, opacity: 0.06, fontSize: "13vw", letterSpacing: "-0.02em" }}>
        AgriHakStat
      </span>
      <span className="absolute bottom-4 right-6 text-xs font-medium select-none" style={{ color: NAVY, opacity: 0.35 }}>
        Conçu par Hakibou MOUSSA
      </span>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}`}>{children}</div>;
}

function TabButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
      style={active ? { background: NAVY, color: "white" } : { background: "white", color: "#5A6478", border: "1px solid #E4E6ED" }}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2 bg-white"
      style={{ "--tw-ring-color": GOLD }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((v) => (
        <option key={v.id} value={v.id}>{v.label}</option>
      ))}
    </select>
  );
}

export default function AnalysisConfig({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin, dataset, analysisQueue, onAnalysisQueueChange, context }) {
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [tab, setTab] = useState("bivariee");
  const [included, setIncluded] = useState(["sup_semee", "rendement", "filiere", "commune", "pluvio_decade", "acces_credit"]);
  const [x, setX] = useState("sup_semee");
  const [y, setY] = useState("pluvio_decade");
  const [override, setOverride] = useState(null);
  const [confirmed, setConfirmed] = useState({});
  const queue = analysisQueue || [];
  const setQueue = onAnalysisQueueChange || (() => {});

  const variables = dataset
    ? dataset.columns.filter((c) => c.type !== "Vide" && c.type !== "Texte libre").map((c) => ({
        id: c.name, label: c.name, type: c.type, isQuantitative: c.isQuantitative, modalites: c.modalites,
      }))
    : VARIABLES;

  // Réinitialise la sélection dès qu'un nouveau fichier réel est importé
  useEffect(() => {
    if (dataset) {
      const ids = variables.map((v) => v.id);
      setIncluded(ids);
      const quant = variables.filter((v) => v.isQuantitative);
      const qual = variables.filter((v) => !v.isQuantitative);
      setX((quant[0] || variables[0])?.id);
      setY((qual[0] || variables[1] || variables[0])?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);

  const availableVars = variables.filter((v) => included.includes(v.id));

  const toggleIncluded = (id) =>
    setIncluded((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  // Variables jugées prioritaires car mentionnées (même partiellement) dans le nom ou la formule d'un indicateur déclaré
  function normalizeTxt(s) {
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[_\-]/g, " ");
  }
  const indicateurTexts = (context?.indicateurs || []).map((k) => normalizeTxt(`${k.nom} ${k.formule || ""}`));
  const isPriority = (v) => {
    if (indicateurTexts.length === 0) return false;
    const tokens = normalizeTxt(v.label).split(/\s+/).filter((t) => t.length >= 4);
    return tokens.some((t) => indicateurTexts.some((txt) => txt.includes(t)));
  };
  const variablesWithPriority = variables.map((v) => ({ ...v, priority: isPriority(v) }));
  const priorityVariables = variablesWithPriority.filter((v) => v.priority);

  const [variableSearch, setVariableSearch] = useState("");
  const searchNorm = normalizeTxt(variableSearch);
  const filteredVariables = variablesWithPriority.filter((v) => !searchNorm || normalizeTxt(v.label).includes(searchNorm));
  const sortByPriority = (a, b) => (b.priority === a.priority ? 0 : b.priority ? 1 : -1);
  const groupedVariables = {
    quantitative: filteredVariables.filter((v) => v.isQuantitative).sort(sortByPriority),
    qualitative: filteredVariables.filter((v) => !v.isQuantitative).sort(sortByPriority),
  };

  // Propose automatiquement des analyses dès qu'une base et des indicateurs sont disponibles (une seule fois par import)
  const autoSuggestDone = useRef(false);
  useEffect(() => {
    if (dataset && context?.indicateurs?.length > 0 && !autoSuggestDone.current) {
      autoSuggestDone.current = true;
      fetchSuggestions();
    }
    if (!dataset) autoSuggestDone.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);

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
          columns: availableVars.map((v) => ({ name: v.id, isQuantitative: v.isQuantitative, type: v.type })),
        }),
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

  const proposal = proposeTest(x, y, variables, dataset);
  const activeTest = override || proposal?.test;
  const xVar = variables.find((v) => v.id === x);
  const yVar = variables.find((v) => v.id === y);
  const conditions = activeTest ? getConditions(activeTest, { dataset, xId: x, yId: y }) : [];
  const allConfirmed = conditions.length > 0 && conditions.every((_, i) => confirmed[i]);
  const realStat = activeTest ? computeRealStat(activeTest, x, y, dataset) : null;

  useEffect(() => { setConfirmed({}); }, [activeTest, x, y]);

  const addToQueue = () => {
    if (!proposal || !allConfirmed) return;
    setQueue([
      ...queue,
      {
        id: Date.now(),
        label: `${xVar.label} × ${yVar.label}`,
        xId: x,
        yId: y,
        xLabel: xVar.label,
        yLabel: yVar.label,
        test: activeTest,
        status: override ? "adjusted" : "auto",
        conditionsCount: conditions.length,
        detail: realStat?.detail,
      },
    ]);
    setOverride(null);
    setConfirmed({});
  };


  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <Watermark />
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <Sidebar active={active} onNavigate={onNavigate} />

        {/* Main */}
        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Configuration des analyses</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {dataset
                  ? <>Données réelles : <span className="font-medium" style={{ color: "#256B45" }}>{dataset.fileName}</span> ({dataset.rows.length} lignes)</>
                  : "Aucun fichier importé — exemple illustratif (Suivi semis 2026-2027)"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8 grid grid-cols-3 gap-6">
            <div className="col-span-2">
              {/* Variables retenues pour la session d'analyse */}
              <Card className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Variables retenues pour cette session</h2>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {dataset
                    ? `Variables détectées dans ${dataset.fileName}. Seules celles cochées seront proposées dans les analyses ci-dessous.`
                    : "Seules les variables cochées seront proposées dans les analyses ci-dessous (exemple illustratif — importez un fichier pour vos propres variables)."}
                </p>

                {variables.length > 8 && (
                  <input
                    type="text"
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                    placeholder={`Rechercher parmi les ${variables.length} variables…`}
                    className="w-full text-sm rounded-xl border border-gray-200 p-2.5 mb-3 focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": GOLD }}
                  />
                )}

                {priorityVariables.length > 0 && (
                  <p className="text-[11px] mb-2 flex items-center gap-1" style={{ color: "#8A5A00" }}>
                    <Star size={11} fill="#C99A2E" style={{ color: GOLD }} /> {priorityVariables.length} variable{priorityVariables.length > 1 ? "s" : ""} en lien avec vos indicateurs déclarés — mise{priorityVariables.length > 1 ? "s" : ""} en avant ci-dessous.
                  </p>
                )}

                {[
                  { label: "Quantitatives", list: groupedVariables.quantitative },
                  { label: "Qualitatives", list: groupedVariables.qualitative },
                ].map(({ label, list }) => list.length > 0 && (
                  <div key={label} className="mb-3">
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-1.5">{label} · {list.length}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => toggleIncluded(v.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1"
                          style={
                            included.includes(v.id)
                              ? { background: v.priority ? "#FDF1DA" : NAVY_TINT, borderColor: v.priority ? GOLD : NAVY, color: v.priority ? "#8A5A00" : NAVY }
                              : { background: "white", borderColor: "#D8DEE9", color: "#B0B7C6" }
                          }
                        >
                          {v.priority && <Star size={10} fill={included.includes(v.id) ? "#C99A2E" : "none"} style={{ color: GOLD }} />}
                          {included.includes(v.id) ? <Check size={11} /> : null}
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {variables.length > 0 && groupedVariables.quantitative.length === 0 && groupedVariables.qualitative.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Aucune variable ne correspond à cette recherche.</p>
                )}
              </Card>

              {/* Suggestions d'analyses proposées par Claude, à valider avant configuration */}
              <Card className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Wand2 size={16} style={{ color: GOLD }} />
                    <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Suggestions de Claude</h2>
                  </div>
                  <button onClick={fetchSuggestions} disabled={!dataset || suggestLoading}
                    className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                    style={{ background: NAVY }}>
                    <Wand2 size={12} /> {suggestLoading ? "Analyse en cours…" : "Proposer des analyses"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {dataset
                    ? "Claude examine vos variables et le contexte de l'étude pour proposer des croisements pertinents — chaque suggestion reste à valider avant tout calcul."
                    : "Importez d'abord une base de données pour activer les suggestions."}
                </p>
                {suggestError && (
                  <div className="rounded-xl px-3 py-2 mb-2 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>{suggestError}</div>
                )}
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 p-3 flex items-start justify-between gap-3" style={{ background: "#FDF9F0" }}>
                        <div>
                          <div className="text-xs font-semibold" style={{ color: NAVY }}>{s.xId} × {s.yId}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{s.rationale}</div>
                        </div>
                        <button onClick={() => applySuggestion(s)}
                          className="shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-lg text-white whitespace-nowrap"
                          style={{ background: "#256B45" }}>
                          Configurer cette analyse
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Tabs */}
              <div className="flex gap-2 mb-5">
                <TabButton label="Univariée" icon={Sigma} active={tab === "univariee"} onClick={() => setTab("univariee")} />
                <TabButton label="Bivariée" icon={TrendingUp} active={tab === "bivariee"} onClick={() => setTab("bivariee")} />
                <TabButton label="Multivariée" icon={Layers} active={tab === "multivariee"} onClick={() => setTab("multivariee")} />
              </div>

              {/* BIVARIÉE */}
              {tab === "bivariee" && (
                <Card>
                  <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Analyse bivariée</h2>
                  <p className="text-xs text-gray-400 mb-5">Sélectionnez deux variables : le test statistique adapté est proposé automatiquement.</p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">Variable X</label>
                      <Select value={x} onChange={(v) => { setX(v); setOverride(null); }} options={availableVars} placeholder="Choisir une variable" />
                      {xVar && <div className="text-[11px] text-gray-400 mt-1">{xVar.type}</div>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">Variable Y</label>
                      <Select value={y} onChange={(v) => { setY(v); setOverride(null); }} options={availableVars} placeholder="Choisir une variable" />
                      {yVar && <div className="text-[11px] text-gray-400 mt-1">{yVar.type}</div>}
                    </div>
                  </div>

                  {proposal && (
                    <>
                      <div className="rounded-2xl p-4 border mb-4" style={{ background: override ? AMBER_TINT : NAVY_TINT, borderColor: "transparent" }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Wand2 size={15} style={{ color: override ? AMBER : NAVY }} />
                            <span className="text-sm font-semibold" style={{ color: override ? AMBER : NAVY }}>{activeTest}</span>
                          </div>
                          <span className="text-[11px] font-medium px-2 py-1 rounded-full"
                            style={{ background: "white", color: override ? AMBER : NAVY }}>
                            {override ? "Ajusté par l'analyste" : "Proposé automatiquement"}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs mb-3" style={{ color: override ? AMBER : "#3A5488" }}>
                          <Info size={13} className="mt-0.5 shrink-0" />
                          <span>{proposal.justification}</span>
                        </div>

                        {realStat && !realStat.error && (
                          <div className="rounded-xl bg-white/70 px-3 py-2 mb-3 text-xs font-mono" style={{ color: NAVY }}>
                            Résultat calculé sur les données importées : {realStat.detail}
                          </div>
                        )}
                        {realStat?.error && (
                          <div className="rounded-xl bg-white/70 px-3 py-2 mb-3 text-xs" style={{ color: "#B3413A" }}>
                            Calcul impossible : {realStat.error}
                          </div>
                        )}
                        {!dataset && (
                          <div className="rounded-xl bg-white/70 px-3 py-2 mb-3 text-xs text-gray-400 italic">
                            Aucun fichier importé — importez une base à l'étape « Assistant d'import » pour un calcul réel.
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Pencil size={13} className="text-gray-400" />
                          <select
                            value={activeTest}
                            onChange={(e) => setOverride(e.target.value === proposal.test ? null : e.target.value)}
                            className="text-xs rounded-lg border border-gray-200 p-1.5 bg-white focus:outline-none"
                          >
                            {proposal.alternatives.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                          <span className="text-[11px] text-gray-400">Ajuster le test si nécessaire</span>
                        </div>
                      </div>

                      {/* Conditions de validation — demandées automatiquement, validées par l'opérateur */}
                      <div className="rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <ShieldCheck size={15} style={{ color: NAVY }} />
                          <span className="text-sm font-semibold" style={{ color: NAVY }}>Conditions de validation du test</span>
                        </div>
                        <div className="space-y-2">
                          {conditions.map((c, i) => {
                            const s = STATUS_STYLE[c.status];
                            const Icon = s.icon;
                            return (
                              <label key={i} className="flex items-start gap-3 rounded-xl p-2.5 cursor-pointer" style={{ background: s.bg }}>
                                <input
                                  type="checkbox"
                                  checked={!!confirmed[i]}
                                  onChange={(e) => setConfirmed({ ...confirmed, [i]: e.target.checked })}
                                  className="w-4 h-4 rounded mt-0.5"
                                  style={{ accentColor: s.color }}
                                />
                                <Icon size={15} style={{ color: s.color }} className="mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <div className="text-xs font-medium" style={{ color: s.color }}>{c.label}</div>
                                  {c.detail && <div className="text-[11px] text-gray-500 mt-0.5">{c.detail}</div>}
                                </div>
                                <span className="text-[10px] font-semibold shrink-0" style={{ color: s.color }}>{s.text}</span>
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3">
                          Chaque condition — y compris celles jugées conformes — requiert une confirmation explicite avant l'exécution de l'analyse.
                        </p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={addToQueue}
                    disabled={!allConfirmed}
                    className="mt-5 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: allConfirmed ? `linear-gradient(135deg, ${NAVY}, #2A4A82)` : "#B0B7C6" }}
                  >
                    <Plus size={15} /> {allConfirmed ? "Ajouter à la file d'analyses" : `Confirmer les ${conditions.length} conditions pour continuer`}
                  </button>
                </Card>
              )}

              {/* UNIVARIÉE */}
              {tab === "univariee" && (
                <Card>
                  <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Analyse univariée</h2>
                  <p className="text-xs text-gray-400 mb-5">
                    {dataset ? "Statistiques calculées réellement à partir du fichier importé." : "Cochez les variables à décrire : les statistiques calculées s'adaptent au type détecté."}
                  </p>
                  <div className="space-y-2">
                    {availableVars.map((v) => {
                      let real = null;
                      if (dataset) {
                        try {
                          real = v.isQuantitative ? descriptiveStats(dataset.rows, v.id) : frequencies(dataset.rows, v.id).slice(0, 3);
                        } catch (e) { real = null; }
                      }
                      return (
                        <div key={v.id} className="rounded-xl border border-gray-100 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked className="w-4 h-4 rounded" readOnly style={{ accentColor: NAVY }} />
                              <span className="text-sm text-gray-800">{v.label}</span>
                            </div>
                            {!dataset && (
                              <span className="text-[11px] text-gray-400">
                                {v.isQuantitative ? "Moyenne, médiane, écart-type" : "Fréquences, mode"}
                              </span>
                            )}
                          </div>
                          {real && v.isQuantitative && (
                            <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                              {[["Moyenne", real.moyenne], ["Médiane", real.mediane], ["Écart-type", real.ecartType], ["CV (%)", real.cv]].map(([l, val]) => (
                                <div key={l} className="rounded-lg py-1.5" style={{ background: NAVY_TINT }}>
                                  <div className="text-[10px] text-gray-500">{l}</div>
                                  <div className="text-xs font-bold" style={{ color: NAVY }}>{val.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {real && !v.isQuantitative && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {real.map((f) => (
                                <span key={f.modalite} className="text-[10px] px-2 py-1 rounded-full" style={{ background: NAVY_TINT, color: NAVY }}>
                                  {f.modalite} · {f.pct.toFixed(0)}% (n={f.n})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* MULTIVARIÉE */}
              {tab === "multivariee" && (
                <Card>
                  <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Analyse multivariée</h2>
                  <p className="text-xs text-gray-400 mb-5">Choisissez la méthode, puis les variables à inclure.</p>
                  <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: AMBER_TINT, color: AMBER }}>
                    Les méthodes multivariées (ACP, AFC, CAH, régression) nécessitent le moteur de calcul R décrit dans l'architecture technique — non encore branché à cette maquette. L'écran ci-dessous reste illustratif.
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {["ACP", "AFC", "Classification (CAH)", "Régression multiple"].map((m, i) => (
                      <label key={m} className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer text-sm ${i === 3 ? "border-2" : "border-gray-100"}`}
                        style={i === 3 ? { borderColor: GOLD, background: "#FDF9F0" } : {}}>
                        <input type="radio" name="method" defaultChecked={i === 3} style={{ accentColor: NAVY }} />
                        {m}
                      </label>
                    ))}
                  </div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Variable dépendante</label>
                  <Select value="rendement" onChange={() => {}} options={availableVars} placeholder="Choisir" />
                  <label className="text-xs font-medium text-gray-600 block mb-1.5 mt-4">Variables explicatives</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Superficie semée", "Pluviométrie décadaire", "Accès au crédit", "Satisfaction intrants"].map((v) => (
                      <span key={v} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: NAVY_TINT, color: NAVY }}>{v}</span>
                    ))}
                  </div>
                  <div className="rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={15} style={{ color: NAVY }} />
                      <span className="text-sm font-semibold" style={{ color: NAVY }}>Conditions de validation du modèle</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Absence de multicolinéarité (VIF < 5 pour chaque variable explicative)", status: "ok", detail: "VIF max = 2,1" },
                        { label: "Normalité des résidus (Shapiro-Wilk)", status: "ok", detail: "p = 0,22" },
                        { label: "Homoscédasticité des résidus", status: "warn", detail: "Tendance légère à examiner" },
                      ].map((c, i) => {
                        const s = STATUS_STYLE[c.status];
                        const Icon = s.icon;
                        return (
                          <label key={i} className="flex items-start gap-3 rounded-xl p-2.5 cursor-pointer" style={{ background: s.bg }}>
                            <input type="checkbox" className="w-4 h-4 rounded mt-0.5" style={{ accentColor: s.color }} />
                            <Icon size={15} style={{ color: s.color }} className="mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs font-medium" style={{ color: s.color }}>{c.label}</div>
                              <div className="text-[11px] text-gray-500 mt-0.5">{c.detail}</div>
                            </div>
                            <span className="text-[10px] font-semibold shrink-0" style={{ color: s.color }}>{s.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* File d'analyses */}
            <div>
              <Card>
                <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>File d'analyses configurées</h2>
                <p className="text-xs text-gray-400 mb-4">{queue.length} analyse{queue.length > 1 ? "s" : ""} prête{queue.length > 1 ? "s" : ""} à exécuter</p>
                <div className="space-y-2 mb-5">
                  {queue.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl border border-gray-100 p-3">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-800">{item.label}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{item.test}</div>
                        {item.detail && <div className="text-[10px] font-mono text-gray-400 mt-0.5">{item.detail}</div>}
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1"
                          style={item.status === "adjusted" ? { background: AMBER_TINT, color: AMBER } : { background: GREEN_TINT, color: GREEN }}>
                          {item.status === "adjusted" ? <Pencil size={9} /> : <Check size={9} />}
                          {item.status === "adjusted" ? "Ajusté" : "Auto"} · {item.conditionsCount} condition{item.conditionsCount > 1 ? "s" : ""} validée{item.conditionsCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <button onClick={() => setQueue(queue.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {queue.length === 0 && <div className="text-xs text-gray-400 italic">Aucune analyse ajoutée pour l'instant.</div>}
                </div>
                <button
                  onClick={() => onNavigate("results")}
                  disabled={queue.length === 0}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, #3E9C6B, ${GREEN})` }}
                >
                  <Play size={14} /> Lancer les analyses
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
