import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, Check, Pencil, FileDown, FileType2, Layers,
  ListChecks, Paperclip, Sparkles, ShieldCheck, MapPin, Info, Inbox,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import {
  BarChart, Bar, ErrorBar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  pearsonCorrelation, spearmanCorrelation, oneWayAnova, kruskalWallis,
  mannWhitneyU, chiSquareTest, numericValues,
} from "./realStats.js";
import { exportReportToDocx } from "./exportDocx.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";
const GREEN_TINT = "#E4F5EC";
const AMBER = "#8A5A00";
const AMBER_TINT = "#FDF1DA";
const NAVY_TINT = "#EBEEF7";
const PALETTE = ["#1F3864", "#3E9C6B", "#C99A2E", "#3592C4", "#B5651D", "#6C7DAE", "#B3413A", "#7A8A3E"];

const nav = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: BarChart3 },
  { id: "results", label: "Résultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
];

const reportSections = [
  "1. Contexte de l'étude", "2. Objectifs", "3. Indicateurs de performance mesurés",
  "4. Méthodologie", "5. Résultats", "6. Analyse", "7. Recommandations", "8. Conclusion",
];

function fmtP(p) {
  if (p === undefined || p === null || isNaN(p)) return "—";
  return p < 0.001 ? "< 0,001" : p.toFixed(3);
}

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

function StatusBadge({ status }) {
  const adjusted = status === "adjusted";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full"
      style={adjusted ? { background: AMBER_TINT, color: AMBER } : { background: GREEN_TINT, color: GREEN }}>
      {adjusted ? <Pencil size={9} /> : <Check size={9} />}
      {adjusted ? "Ajusté par l'analyste" : "Proposé automatiquement"}
    </span>
  );
}

function ResultHeader({ title, subtitle, status }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-serif font-semibold text-sm" style={{ color: NAVY }}>{title}</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

// Rendu réel d'une analyse de la file, à partir des vraies données importées
function AnalysisResultCard({ item, dataset, index, validated, onToggleValidated }) {
  const validationBar = (
    <label className="flex items-center gap-2 mb-3 text-xs cursor-pointer select-none">
      <input type="checkbox" checked={!!validated} onChange={onToggleValidated} className="w-4 h-4 rounded" style={{ accentColor: "#256B45" }} />
      <span className={validated ? "font-medium" : "text-gray-400"} style={validated ? { color: "#256B45" } : {}}>
        {validated ? "Validé pour le rapport" : "Valider cette analyse pour l'inclure au rapport"}
      </span>
    </label>
  );

  if (!dataset) {
    return (
      <Card>
        {validationBar}
        <ResultHeader title={item.label} subtitle={item.test} status={item.status} />
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-400 italic">
          Exemple illustratif — aucune base de données réelle n'était importée lors de la configuration de cette analyse.
        </div>
      </Card>
    );
  }

  const xCol = dataset.columns.find((c) => c.name === item.xId);
  const yCol = dataset.columns.find((c) => c.name === item.yId);
  if (!xCol || !yCol) {
    return (
      <Card>
        {validationBar}
        <ResultHeader title={item.label} subtitle={item.test} status={item.status} />
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>
          Les colonnes de cette analyse ne sont plus présentes dans la base actuellement importée.
        </div>
      </Card>
    );
  }


  const isXQuant = xCol.isQuantitative, isYQuant = yCol.isQuantitative;
  const test = item.test;

  try {
    // ---- Corrélations (Pearson / Spearman) ----
    if (test === "Corrélation de Pearson" || test === "Corrélation de Spearman") {
      const r = test === "Corrélation de Pearson"
        ? pearsonCorrelation(dataset.rows, item.xId, item.yId)
        : spearmanCorrelation(dataset.rows, item.xId, item.yId);
      const scatter = dataset.rows
        .map((row) => ({ x: Number(row[item.xId]), y: Number(row[item.yId]) }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));
      const symbol = test === "Corrélation de Pearson" ? "r" : "ρ";
      return (
        <Card>
          {validationBar}
          <ResultHeader title={item.label} subtitle={`${test} · ${symbol} = ${r.r.toFixed(3)}, n = ${r.n}, p = ${fmtP(r.p)}`} status={item.status} />
          <ResponsiveContainer width="100%" height={190}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
              <XAxis dataKey="x" tick={{ fontSize: 11 }} stroke="#999" name={item.xLabel} type="number" domain={["dataMin", "dataMax"]} />
              <YAxis dataKey="y" tick={{ fontSize: 11 }} stroke="#999" name={item.yLabel} width={55} type="number" domain={["dataMin", "dataMax"]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatter} fill={NAVY} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            {Math.abs(r.r) < 0.1 ? "Association quasi nulle" : Math.abs(r.r) < 0.3 ? "Association faible" : Math.abs(r.r) < 0.5 ? "Association modérée" : "Association forte"}
            {" "}entre {item.xLabel} et {item.yLabel}, {r.p < 0.05 ? "statistiquement significative (p < 0,05)" : "non significative au seuil de 5 %"}.
          </p>
        </Card>
      );
    }

    // ---- Comparaison de groupes (Student / ANOVA / Mann-Whitney / Kruskal-Wallis) ----
    if (["Test de Student", "ANOVA à un facteur", "Test de Mann-Whitney", "Test de Kruskal-Wallis"].includes(test)) {
      const [quantCol, qualCol] = isXQuant ? [item.xId, item.yId] : [item.yId, item.xId];
      const [quantLabel, qualLabel] = isXQuant ? [item.xLabel, item.yLabel] : [item.yLabel, item.xLabel];
      const isNonParam = test === "Test de Mann-Whitney" || test === "Test de Kruskal-Wallis";

      if (isNonParam) {
        const res = test === "Test de Mann-Whitney" ? mannWhitneyU(dataset.rows, quantCol, qualCol) : kruskalWallis(dataset.rows, quantCol, qualCol);
        // Médianes par groupe pour l'illustration graphique
        const groups = {};
        dataset.rows.forEach((r) => {
          const g = String(r[qualCol] ?? "").trim(); const v = Number(r[quantCol]);
          if (g === "" || isNaN(v)) return; (groups[g] = groups[g] || []).push(v);
        });
        const chartData = Object.entries(groups).map(([g, vals]) => {
          const sorted = [...vals].sort((a, b) => a - b);
          return { groupe: g, mediane: sorted[Math.floor(sorted.length / 2)], n: vals.length };
        });
        const stat = test === "Test de Mann-Whitney" ? `U = ${res.U.toFixed(1)}, z = ${res.z.toFixed(2)}` : `H(${res.df}) = ${res.H.toFixed(2)}`;
        return (
          <Card>
            {validationBar}
            <ResultHeader title={item.label} subtitle={`${test} · ${stat}, p = ${fmtP(res.p)}`} status={item.status} />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                <XAxis dataKey="groupe" tick={{ fontSize: 11 }} stroke="#999" />
                <YAxis tick={{ fontSize: 11 }} stroke="#999" width={55} />
                <Tooltip />
                <Bar dataKey="mediane" name={`Médiane de ${quantLabel}`} radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={d.groupe} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">
              Différence {res.p < 0.05 ? "statistiquement significative" : "non significative"} de {quantLabel} selon {qualLabel} (test non paramétrique, p = {fmtP(res.p)}).
            </p>
          </Card>
        );
      }

      const a = oneWayAnova(dataset.rows, quantCol, qualCol);
      const chartData = a.groupStats.map((g) => ({ groupe: g.groupe, moyenne: g.moyenne, ecart: [g.ecartType, g.ecartType], n: g.n }));
      const statLabel = test === "Test de Student" ? `t ≈ ${Math.sqrt(a.F).toFixed(2)}` : `F(${a.dfBetween},${a.dfWithin}) = ${a.F.toFixed(2)}, η² = ${a.etaSq.toFixed(2)}`;
      return (
        <Card>
          {validationBar}
          <ResultHeader title={item.label} subtitle={`${test} · ${statLabel}, p = ${fmtP(a.p)}`} status={item.status} />
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
              <XAxis dataKey="groupe" tick={{ fontSize: 11 }} stroke="#999" />
              <YAxis tick={{ fontSize: 11 }} stroke="#999" width={55} />
              <Tooltip />
              <Bar dataKey="moyenne" name={`Moyenne de ${quantLabel}`} radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => <Cell key={d.groupe} fill={PALETTE[i % PALETTE.length]} />)}
                <ErrorBar dataKey="ecart" width={4} strokeWidth={1.5} stroke="#7A7A7A" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Le {quantLabel.toLowerCase()} moyen {a.p < 0.05 ? "diffère significativement" : "ne diffère pas significativement"} selon {qualLabel.toLowerCase()} (p = {fmtP(a.p)}).
          </p>
        </Card>
      );
    }

    // ---- Khi² / V de Cramér ----
    if (test === "Test du Khi² d'indépendance" || test === "V de Cramér (mesure d'association)") {
      const c = chiSquareTest(dataset.rows, item.xId, item.yId);
      return (
        <Card>
          {validationBar}
          <ResultHeader title={item.label} subtitle={`${test} · χ²(${c.df}) = ${c.chi2.toFixed(2)}, p = ${fmtP(c.p)}, V = ${c.cramersV.toFixed(2)}`} status={item.status} />
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr>
                  <th className="text-left text-[10px] text-gray-400 uppercase pb-1 pr-3">{item.xLabel} \ {item.yLabel}</th>
                  {c.yList.map((y) => <th key={y} className="text-[10px] text-gray-400 uppercase pb-1 px-2">{y}</th>)}
                </tr>
              </thead>
              <tbody>
                {c.xList.map((x) => (
                  <tr key={x} className="border-t border-gray-50">
                    <td className="py-1.5 pr-3 font-medium text-gray-700">{x}</td>
                    {c.yList.map((y) => (
                      <td key={y} className="py-1.5 px-2 text-center text-gray-600">{c.table[x]?.[y] || 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Association {c.p < 0.05 ? "statistiquement significative" : "non significative"} entre {item.xLabel} et {item.yLabel} (p = {fmtP(c.p)}, V de Cramér = {c.cramersV.toFixed(2)}).
          </p>
        </Card>
      );
    }
  } catch (e) {
    return (
      <Card>
        {validationBar}
        <ResultHeader title={item.label} subtitle={item.test} status={item.status} />
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>
          Calcul impossible sur les données actuelles : {e.message}
        </div>
      </Card>
    );
  }

  return null;
}


export default function ResultsReport({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin, dataset, analysisQueue, onAnalysisQueueChange, context, onContextChange }) {
  const [sections, setSections] = useState(reportSections);
  const [format, setFormat] = useState("docx");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReport, setAiReport] = useState(context?.aiReport || null); // { analyse, recommandations, conclusion }
  const [exporting, setExporting] = useState(false);
  const queue = analysisQueue || [];

  const toggleSection = (s) =>
    setSections((prev) => (prev.includes(s) ? prev.filter((i) => i !== s) : [...prev, s]));

  const toggleValidated = (idx) => {
    if (!onAnalysisQueueChange) return;
    const next = queue.map((item, i) => (i === idx ? { ...item, validated: !item.validated } : item));
    onAnalysisQueueChange(next);
  };

  const validatedQueue = queue.filter((item) => item.validated);
  const queueForReport = validatedQueue.length > 0 ? validatedQueue : queue;
  const significantCount = queueForReport.filter((item) => item.detail && /p\s*=\s*(0[,.]0[0-4]|<\s*0[,.]001)/.test(item.detail)).length;

  const generateWithClaude = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, analyses: queueForReport }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue du service de génération.");
      setAiReport(data);
      if (onContextChange && context) onContextChange({ ...context, aiReport: data });
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportToDocx({ context, queue: queueForReport, aiReport, dataset });
    } catch (e) {
      setAiError("Échec de l'export : " + e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <Watermark />
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-60 min-h-screen shrink-0 py-6 px-4 text-[#C7D2E8]"
          style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #16294B 100%)` }}>
          <div className="flex flex-col items-start gap-1 px-2 mb-8">
            <img src="./logo-compact.png" alt="AgriHakStat" className="h-32 w-auto -ml-1" />
            <div className="text-[10px] opacity-60">DDAEP-Borgou</div>
          </div>
          <nav className="space-y-1.5">
            {nav.map((item) => (
              <div key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                  item.id === active ? "bg-[#16294B] text-white font-medium border-l-4" : "hover:bg-white/5"
                }`}
                style={item.id === active ? { borderColor: GOLD } : {}}>
                <item.icon size={17} />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Résultats &amp; rapport final</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {dataset ? `${dataset.fileName} · ` : ""}{queue.length} analyse{queue.length > 1 ? "s" : ""} configurée{queue.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8 grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-5">
              {queue.length === 0 ? (
                <Card className="text-center py-12">
                  <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">Aucune analyse configurée pour l'instant</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4 max-w-sm mx-auto">
                    Rendez-vous dans « Configuration des analyses » pour sélectionner des variables, valider un test statistique, puis l'ajouter à la file.
                  </p>
                  <button onClick={() => onNavigate("config")}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                    Aller à la configuration des analyses
                  </button>
                </Card>
              ) : (
                <>
                  {!dataset && (
                    <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: AMBER_TINT }}>
                      <Info size={14} style={{ color: AMBER }} className="mt-0.5 shrink-0" />
                      <p className="text-xs" style={{ color: AMBER }}>
                        Aucune base de données réelle n'est actuellement importée : les analyses ci-dessous sont présentées à titre d'exemple. Importez un fichier via l'assistant d'import pour des résultats calculés sur vos propres données.
                      </p>
                    </div>
                  )}

                  {queue.map((item, i) => (
                    <AnalysisResultCard key={item.id || i} item={item} dataset={dataset} index={i}
                      validated={item.validated} onToggleValidated={() => toggleValidated(i)} />
                  ))}

                  {validatedQueue.length > 0 && validatedQueue.length < queue.length && (
                    <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: NAVY_TINT }}>
                      <Check size={14} style={{ color: NAVY }} className="mt-0.5 shrink-0" />
                      <p className="text-xs" style={{ color: NAVY }}>
                        {validatedQueue.length} analyse{validatedQueue.length > 1 ? "s" : ""} sur {queue.length} validée{validatedQueue.length > 1 ? "s" : ""} — seules celles-ci seront reprises dans le rapport et l'export.
                      </p>
                    </div>
                  )}

                  {/* Section 6 — Analyse */}
                  <Card className="border-2" style={{ borderColor: GOLD }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} style={{ color: GOLD }} />
                        <h3 className="font-serif font-semibold text-sm" style={{ color: NAVY }}>6. Analyse</h3>
                      </div>
                      <button onClick={generateWithClaude} disabled={aiLoading || queueForReport.length === 0}
                        className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                        style={{ background: NAVY }}>
                        <Sparkles size={12} /> {aiLoading ? "Rédaction en cours…" : aiReport ? "Régénérer avec Claude" : "Rédiger avec Claude"}
                      </button>
                    </div>

                    {aiError && (
                      <div className="rounded-xl px-3 py-2 mb-3 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>{aiError}</div>
                    )}

                    {aiReport ? (
                      <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{aiReport.analyse}</div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                          Sur les {queueForReport.length} analyse{queueForReport.length > 1 ? "s" : ""} {validatedQueue.length > 0 ? "validée" + (queueForReport.length > 1 ? "s" : "") : "configurée" + (queueForReport.length > 1 ? "s" : "")}, {significantCount} présente{significantCount > 1 ? "nt" : ""} un résultat statistiquement significatif au seuil de 5 %.
                          {dataset ? "" : " Ce constat porte sur des données d'exemple et non sur une base réellement importée."}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                          Cliquez « Rédiger avec Claude » pour une lecture croisée rédigée en français scientifique, à partir du contexte de l'étude, des indicateurs déclarés et des résultats ci-dessus — ou complétez cette section vous-même.
                        </p>
                      </>
                    )}
                  </Card>

                  {/* Section 7 — Recommandations */}
                  <Card className="border-2" style={{ borderColor: "#3E9C6B" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={16} style={{ color: GREEN }} />
                      <h3 className="font-serif font-semibold text-sm" style={{ color: NAVY }}>7. Recommandations</h3>
                    </div>
                    {aiReport ? (
                      <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{aiReport.recommandations}</div>
                    ) : (
                      <p className="text-xs text-gray-500 leading-relaxed italic">
                        Section à compléter par l'analyste, ou générée automatiquement avec Claude (bouton ci-dessus), sur la base des constats de la section Analyse et du contexte propre à l'étude (section 4.2 du cahier des charges).
                      </p>
                    )}
                  </Card>

                  {aiReport?.conclusion && (
                    <Card>
                      <div className="flex items-center gap-2 mb-2">
                        <ListChecks size={16} style={{ color: NAVY }} />
                        <h3 className="font-serif font-semibold text-sm" style={{ color: NAVY }}>8. Conclusion</h3>
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{aiReport.conclusion}</div>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Panneau de génération du rapport */}
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Sommaire du rapport</h2>
                </div>
                <div className="space-y-1.5">
                  {reportSections.map((s) => (
                    <label key={s} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={sections.includes(s)} onChange={() => toggleSection(s)}
                        className="w-3.5 h-3.5 rounded" style={{ accentColor: NAVY }} />
                      {s}
                    </label>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Annexe automatique</h2>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Tableaux consolidés automatiquement à partir de la file d'analyses (Module 6).</p>
                <div className="space-y-2">
                  {queue.length === 0 && <p className="text-xs text-gray-400 italic">Aucun tableau pour l'instant.</p>}
                  {queue.map((item, i) => (
                    <div key={item.id || i} className="rounded-xl border border-gray-100 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold" style={{ color: NAVY }}>Tableau A{i + 1}</span>
                      </div>
                      <div className="text-[11px] text-gray-600 mt-0.5">{item.test} — {item.label}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} style={{ color: GOLD }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Génération</h2>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <ShieldCheck size={13} style={{ color: GREEN }} />
                  <span className="text-gray-500">Thème : <span className="font-medium" style={{ color: NAVY }}>Ocean Depths / Terre &amp; Moisson</span></span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button onClick={() => setFormat("docx")}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border"
                    style={format === "docx" ? { background: NAVY, color: "white", borderColor: NAVY } : { borderColor: "#D8DEE9", color: "#5A6478" }}>
                    <FileType2 size={13} /> Word (.docx)
                  </button>
                  <button onClick={() => setFormat("pdf")}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border"
                    style={format === "pdf" ? { background: NAVY, color: "white", borderColor: NAVY } : { borderColor: "#D8DEE9", color: "#5A6478" }}>
                    <FileDown size={13} /> PDF
                  </button>
                </div>
                <button disabled={queue.length === 0 || exporting} onClick={handleExport}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, #3E9C6B, ${GREEN})` }}>
                  <Layers size={14} /> {exporting ? "Génération en cours…" : format === "docx" ? "Exporter en Word (.docx)" : "Exporter en Word (PDF à venir)"}
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
