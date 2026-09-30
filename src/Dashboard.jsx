import React, { useRef } from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, Plus, Upload, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, MoreHorizontal, Droplets, Sun, Leaf, MapPin, Info,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import Sidebar from "./Sidebar.jsx";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { ChartExportButton } from "./chartExport.js";

const REAL_DATA_PALETTE = ["#1F3864", "#3E9C6B", "#C99A2E", "#3592C4", "#B5651D", "#6C7DAE", "#B3413A", "#7A8A3E"];

/* ---- Palette par filière (couleurs vives et distinctes) ---- */
const FILIERES = {
  Soja:   { color: "#3E9C6B", tint: "#E4F5EC" },
  Maïs:   { color: "#F0AC1B", tint: "#FDF1DA" },
  Riz:    { color: "#3592C4", tint: "#E3F1FA" },
  Manioc: { color: "#B5651D", tint: "#F6E9DD" },
  Coton:  { color: "#6C7DAE", tint: "#EBEEF7" },
};

// Contenu de démonstration, affiché uniquement en l'absence de base réellement importée et
// d'analyses réellement configurées (cf. hasRealData dans le composant Dashboard ci-dessous) —
// cohérent avec la convention déjà suivie ailleurs dans l'application (AnalysisConfig.jsx,
// ResultsReport.jsx) : un exemple illustratif clairement distingué des données réelles.
const growthData = [
  { decade: "D1 Juin", Soja: 10, "Maïs": 14, Riz: 9, Manioc: 6, Coton: 12 },
  { decade: "D2 Juin", Soja: 24, "Maïs": 29, Riz: 20, Manioc: 15, Coton: 27 },
  { decade: "D3 Juin", Soja: 38, "Maïs": 44, Riz: 33, Manioc: 26, Coton: 41 },
  { decade: "D1 Juil", Soja: 55, "Maïs": 61, Riz: 48, Manioc: 40, Coton: 58 },
  { decade: "D2 Juil", Soja: 70, "Maïs": 77, Riz: 63, Manioc: 54, Coton: 74 },
  { decade: "D3 Juil", Soja: 84, "Maïs": 88, Riz: 76, Manioc: 68, Coton: 81 },
];

const repartition = [
  { name: "Coton", value: 32 },
  { name: "Maïs", value: 26 },
  { name: "Riz", value: 18 },
  { name: "Soja", value: 14 },
  { name: "Manioc", value: 10 },
];

const surveys = [
  { name: "Suivi semis 2026-2027 — Décade 3", filiere: "Coton", commune: "Tchaourou", status: "En cours", date: "20 juil. 2026" },
  { name: "Enquête post-récolte Maïs", filiere: "Maïs", commune: "N'Dali", status: "Terminé", date: "12 juil. 2026" },
  { name: "Suivi campagne Riz irrigué", filiere: "Riz", commune: "Bembéréké", status: "Brouillon", date: "08 juil. 2026" },
  { name: "Enquête ménages Manioc", filiere: "Manioc", commune: "Nikki", status: "En cours", date: "02 juil. 2026" },
];

const statusColors = {
  "En cours": "bg-[#FDF1DA] text-[#8A5A00]",
  "Terminé": "bg-[#E4F5EC] text-[#256B45]",
  "Brouillon": "bg-[#EDEEF3] text-[#525A72]",
};

const kpis = [
  { label: "Enquêtes actives", value: "7", note: "3 filières suivies", icon: ClipboardList, tint: "#EBEEF7", fg: "#1F3864" },
  { label: "Taux moyen de réalisation", value: "81 %", note: "Décade 3 — Juillet", icon: TrendingUp, tint: "#E4F5EC", fg: "#256B45" },
  { label: "Indicateurs sous seuil", value: "2", note: "Coton — Tchaourou, Pérèrè", icon: AlertTriangle, tint: "#FDF1DA", fg: "#8A5A00" },
  { label: "Rapports générés", value: "14", note: "Depuis le 1er juillet", icon: FileText, tint: "#F6E9DD", fg: "#8A4A1D" },
];

const nav = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: BarChart3 },
  { id: "results", label: "Résultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
];

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

function Watermark() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
      <span
        className="font-serif font-black whitespace-nowrap select-none"
        style={{ color: NAVY, opacity: 0.06, fontSize: "13vw", letterSpacing: "-0.02em" }}
      >
        AgriHakStat
      </span>
      <span
        className="absolute bottom-4 right-6 text-xs font-medium select-none"
        style={{ color: NAVY, opacity: 0.35 }}
      >
        Conçu par Hakibou MOUSSA
      </span>
    </div>
  );
}

export default function Dashboard({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin, dataset, analysisQueue, univariateQueue, context }) {
  const growthChartRef = useRef(null);
  const repartitionChartRef = useRef(null);

  const queue = analysisQueue || [];
  const uniQueue = univariateQueue || [];
  // Le tableau de bord bascule vers les données réellement importées/configurées dès qu'une base est
  // présente, plutôt que d'afficher indéfiniment le contenu d'exemple ci-dessus.
  const hasRealData = !!dataset;

  const significantCount = queue.filter((item) => typeof item.p === "number" && !isNaN(item.p) && item.p < 0.05).length;
  const realKpis = [
    {
      label: "Analyses configurées", value: String(queue.length + uniQueue.length),
      note: `${queue.length} bivariée${queue.length > 1 ? "s" : ""} · ${uniQueue.length} univariée${uniQueue.length > 1 ? "s" : ""}`,
      icon: ClipboardList, tint: "#EBEEF7", fg: NAVY,
    },
    {
      label: "Résultats significatifs", value: String(significantCount),
      note: queue.length > 0 ? `sur ${queue.length} analyse${queue.length > 1 ? "s" : ""} bivariée${queue.length > 1 ? "s" : ""} (p < 0,05)` : "aucune analyse bivariée pour l'instant",
      icon: TrendingUp, tint: "#E4F5EC", fg: "#256B45",
    },
    {
      label: "Indicateurs déclarés", value: String((context?.indicateurs || []).length),
      note: "définis pour cette étude", icon: AlertTriangle, tint: "#FDF1DA", fg: "#8A5A00",
    },
    {
      label: "Variables importées", value: String(dataset?.columns?.length || 0),
      note: dataset ? `${dataset.rows.length.toLocaleString("fr-FR")} enregistrement${dataset.rows.length > 1 ? "s" : ""}` : "aucune base importée",
      icon: FileText, tint: "#F6E9DD", fg: "#8A4A1D",
    },
  ];
  const kpisToShow = hasRealData ? realKpis : kpis;

  const quantUni = uniQueue.filter((u) => u.isQuantitative);
  const qualUni = uniQueue.find((u) => !u.isQuantitative && Array.isArray(u.stats) && u.stats.length > 0);
  const meansData = quantUni.map((u) => ({ variable: u.variableLabel, Moyenne: Number(u.stats.moyenne.toFixed(2)) }));
  const recentAnalyses = [...queue].slice(-5).reverse();

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <Watermark />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <Sidebar active={active} onNavigate={onNavigate}>
          <div className="mt-10 mx-2 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sun size={15} style={{ color: GOLD }} />
              <span className="text-xs font-medium text-white">Saison des pluies</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-70">Pic pluviométrique attendu semaine du 10 août sur Tchaourou et Pérèrè.</p>
          </div>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Tableau de bord</h1>
              <p className="text-xs text-gray-500 mt-0.5">Campagne agricole 2026–2027 · Pôle de Développement Agricole n°4</p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8">
            {/* Actions rapides */}
            <div className="flex gap-3 mb-6">
              <button onClick={() => onNavigate("import")} className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-white shadow-md hover:shadow-lg transition-shadow"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                <Plus size={15} /> Nouvelle enquête
              </button>
              <button onClick={() => onNavigate("import")} className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow bg-white"
                style={{ border: `1.5px solid ${GOLD}`, color: "#8A5A00" }}>
                <Upload size={15} /> Importer questionnaire + base
              </button>
            </div>

            {!hasRealData && (
              <div className="flex items-start gap-2 rounded-xl p-3 mb-4" style={{ background: "#FDF1DA" }}>
                <Info size={14} style={{ color: "#8A5A00" }} className="mt-0.5 shrink-0" />
                <p className="text-xs" style={{ color: "#8A5A00" }}>
                  Aucune base de données réelle n'est actuellement importée : le tableau de bord ci-dessous est présenté à titre d'exemple. Importez un fichier via l'assistant d'import pour un tableau de bord calculé sur vos propres données.
                </p>
              </div>
            )}

            {/* KPI cards colorées */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {kpisToShow.map((kpi) => (
                <div key={kpi.label} className="relative rounded-2xl p-4 overflow-hidden shadow-sm border border-black/5"
                  style={{ background: kpi.tint }}>
                  <kpi.icon size={64} style={{ color: kpi.fg, opacity: 0.08 }} className="absolute -right-3 -bottom-3" />
                  <div className="relative flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: kpi.fg, opacity: 0.85 }}>{kpi.label}</span>
                    <kpi.icon size={16} style={{ color: kpi.fg }} />
                  </div>
                  <div className="relative font-serif text-2xl font-bold" style={{ color: kpi.fg }}>{kpi.value}</div>
                  <div className="relative text-[11px] mt-1" style={{ color: kpi.fg, opacity: 0.65 }}>{kpi.note}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Chart principal : statistiques réelles des variables univariées validées, ou exemple illustratif */}
              <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>
                    {hasRealData ? "Moyennes des variables quantitatives validées" : "Progression des semis par filière"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <ChartExportButton targetRef={growthChartRef} filename={hasRealData ? "Moyennes_variables_validees" : "Progression_semis_par_filiere"} />
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  {hasRealData
                    ? "Calculées sur les variables univariées validées dans « Configuration des analyses »."
                    : "Taux de réalisation cumulé (%) par décade — toutes communes — exemple illustratif."}
                </p>
                {hasRealData && meansData.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 px-3 py-6 text-xs text-gray-400 italic text-center">
                    Aucune variable quantitative validée pour l'instant — rendez-vous dans « Configuration des analyses » (onglet Univariée).
                  </div>
                ) : (
                  <div ref={growthChartRef}>
                    <ResponsiveContainer width="100%" height={230}>
                      {hasRealData ? (
                        <BarChart data={meansData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                          <XAxis dataKey="variable" tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#999" />
                          <Tooltip />
                          <Bar dataKey="Moyenne" radius={[6, 6, 0, 0]}>
                            {meansData.map((d, i) => <Cell key={d.variable} fill={REAL_DATA_PALETTE[i % REAL_DATA_PALETTE.length]} />)}
                          </Bar>
                        </BarChart>
                      ) : (
                        <LineChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                          <XAxis dataKey="decade" tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#999" unit="%" />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          {Object.entries(FILIERES).map(([key, val]) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={val.color} strokeWidth={2.5} dot={{ r: 3 }} />
                          ))}
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="h-1 w-16 rounded-full mt-2" style={{ background: GOLD }} />
              </div>

              {/* Répartition : fréquences réelles d'une variable qualitative validée, ou exemple illustratif */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>
                    {hasRealData ? "Répartition" : "Répartition des enquêtes"}
                  </h2>
                  <ChartExportButton targetRef={repartitionChartRef} filename={hasRealData ? "Repartition_variable_validee" : "Repartition_enquetes_par_filiere"} />
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {hasRealData ? (qualUni ? qualUni.variableLabel : "Par filière — exemple illustratif") : "Par filière — campagne en cours (exemple illustratif)"}
                </p>
                {hasRealData && !qualUni ? (
                  <div className="rounded-xl bg-gray-50 px-3 py-6 text-xs text-gray-400 italic text-center">
                    Aucune variable qualitative validée pour l'instant.
                  </div>
                ) : (
                  <>
                    <div ref={repartitionChartRef}>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={hasRealData ? qualUni.stats : repartition}
                            dataKey={hasRealData ? "pct" : "value"}
                            nameKey={hasRealData ? "modalite" : "name"}
                            innerRadius={38} outerRadius={62} paddingAngle={3}
                          >
                            {(hasRealData ? qualUni.stats : repartition).map((entry, i) => (
                              <Cell key={hasRealData ? entry.modalite : entry.name}
                                fill={hasRealData ? REAL_DATA_PALETTE[i % REAL_DATA_PALETTE.length] : FILIERES[entry.name].color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                      {(hasRealData ? qualUni.stats : repartition).map((entry, i) => (
                        <div key={hasRealData ? entry.modalite : entry.name} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: hasRealData ? REAL_DATA_PALETTE[i % REAL_DATA_PALETTE.length] : FILIERES[entry.name].color }} />
                          {hasRealData ? `${entry.modalite} · ${entry.pct.toFixed(0)}%` : `${entry.name} · ${entry.value}%`}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Analyses récentes / alertes : résultats réels de la file d'analyses, ou exemple illustratif */}
            {hasRealData ? (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {recentAnalyses.length === 0 ? (
                  <div className="col-span-3 rounded-2xl p-4 shadow-sm bg-white text-xs text-gray-400 italic text-center">
                    Aucune analyse bivariée configurée pour l'instant — rendez-vous dans « Configuration des analyses ».
                  </div>
                ) : (
                  recentAnalyses.slice(0, 3).map((item) => {
                    const isSig = typeof item.p === "number" && !isNaN(item.p) && item.p < 0.05;
                    const Icon = isSig ? CheckCircle2 : AlertTriangle;
                    const color = isSig ? "#3E9C6B" : "#F0AC1B";
                    return (
                      <div key={item.id} className="rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3" style={{ borderColor: color }}>
                        <Icon size={18} style={{ color }} className="mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{item.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.test} — {isSig ? "résultat significatif" : "résultat non significatif"} {typeof item.p === "number" ? `(p = ${item.p < 0.001 ? "< 0,001" : item.p.toFixed(3)})` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3" style={{ borderColor: "#F0AC1B" }}>
                  <AlertTriangle size={18} style={{ color: "#F0AC1B" }} className="mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Coton — Pérèrè</div>
                    <div className="text-xs text-gray-500 mt-0.5">Taux de réalisation 62 %, sous le seuil décadaire (75 %) — exemple</div>
                  </div>
                </div>
                <div className="rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3" style={{ borderColor: "#D9534F" }}>
                  <Droplets size={18} style={{ color: "#D9534F" }} className="mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Riz — Bembéréké</div>
                    <div className="text-xs text-gray-500 mt-0.5">Anomalie de saisie détectée sur 4 fiches — exemple</div>
                  </div>
                </div>
                <div className="rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3" style={{ borderColor: "#3E9C6B" }}>
                  <CheckCircle2 size={18} style={{ color: "#3E9C6B" }} className="mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Maïs — N'Dali</div>
                    <div className="text-xs text-gray-500 mt-0.5">Objectif décadaire atteint — exemple</div>
                  </div>
                </div>
              </div>
            )}

            {/* Table : file d'analyses complète, ou enquêtes d'exemple */}
            <div className="bg-white rounded-2xl mt-4 overflow-hidden shadow-sm border border-black/5">
              <div className="px-5 py-4 flex items-center justify-between">
                <h2 className="font-serif font-semibold" style={{ color: NAVY }}>
                  {hasRealData ? "Analyses récentes" : "Enquêtes récentes"}
                </h2>
                <Clock size={15} className="text-gray-400" />
              </div>
              {hasRealData ? (
                queue.length === 0 ? (
                  <div className="px-5 pb-5 text-xs text-gray-400 italic">Aucune analyse configurée pour l'instant.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase border-t border-b border-gray-100">
                        <th className="px-5 py-2 font-medium">Analyse</th>
                        <th className="px-5 py-2 font-medium">Test</th>
                        <th className="px-5 py-2 font-medium">Résultat</th>
                        <th className="px-5 py-2 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...queue].reverse().map((item) => {
                        const isSig = typeof item.p === "number" && !isNaN(item.p) && item.p < 0.05;
                        return (
                          <tr key={item.id} className="border-b border-gray-50 last:border-0">
                            <td className="px-5 py-3 text-gray-800">{item.label}</td>
                            <td className="px-5 py-3 text-gray-500">{item.test}</td>
                            <td className="px-5 py-3 text-gray-500 font-mono text-xs">{item.detail || "—"}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${isSig ? "bg-[#E4F5EC] text-[#256B45]" : "bg-[#EDEEF3] text-[#525A72]"}`}>
                                {isSig ? "Significatif" : "Non significatif"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-gray-400 uppercase border-t border-b border-gray-100">
                      <th className="px-5 py-2 font-medium">Enquête</th>
                      <th className="px-5 py-2 font-medium">Filière</th>
                      <th className="px-5 py-2 font-medium">Commune</th>
                      <th className="px-5 py-2 font-medium">Statut</th>
                      <th className="px-5 py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveys.map((s) => (
                      <tr key={s.name} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3 text-gray-800">{s.name}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 text-gray-600">
                            <span className="w-2 h-2 rounded-full" style={{ background: FILIERES[s.filiere].color }} />
                            {s.filiere}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{s.commune}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusColors[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400">{s.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
