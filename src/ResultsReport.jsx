import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, Check, Pencil, FileDown, FileType2, Layers,
  ListChecks, Paperclip, Sparkles, ShieldCheck, CloudRain, Thermometer, MapPin,
} from "lucide-react";
import {
  BarChart, Bar, ErrorBar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";
const GREEN_TINT = "#E4F5EC";
const AMBER = "#8A5A00";
const AMBER_TINT = "#FDF1DA";
const NAVY_TINT = "#EBEEF7";

const FILIERES = {
  Soja: "#3E9C6B", Maïs: "#F0AC1B", Riz: "#3592C4", Manioc: "#B5651D", Coton: "#6C7DAE",
};

const nav = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: BarChart3 },
  { id: "results", label: "Résultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
];

const rendementParFiliere = [
  { filiere: "Coton", moyenne: 1120, ecart: [90, 90] },
  { filiere: "Maïs", moyenne: 1840, ecart: [140, 140] },
  { filiere: "Riz", moyenne: 2210, ecart: [180, 180] },
  { filiere: "Soja", moyenne: 1360, ecart: [110, 110] },
  { filiere: "Manioc", moyenne: 9800, ecart: [620, 620] },
];

// Positions relatives illustratives (mockup) des communes du Borgou, et cumul pluviométrique décadaire (mm) — NASA POWER
const CLIMAT_COMMUNES = [
  { name: "Sinendé", x: 30, y: 10, mm: 108 },
  { name: "Kalalé", x: 68, y: 14, mm: 101 },
  { name: "Bembéréké", x: 42, y: 30, mm: 95 },
  { name: "N'Dali", x: 18, y: 48, mm: 84 },
  { name: "Pérèrè", x: 66, y: 42, mm: 61 },
  { name: "Parakou", x: 40, y: 55, mm: 76 },
  { name: "Nikki", x: 70, y: 62, mm: 89 },
  { name: "Tchaourou", x: 34, y: 82, mm: 58 },
];

function rainColor(mm) {
  // Échelle ambre (déficit) → bleu marine (surplus), cohérente avec le code couleur d'alerte déjà établi
  if (mm < 65) return "#C99A2E";
  if (mm < 80) return "#8FAECB";
  if (mm < 95) return "#4A7AB5";
  return "#1F3864";
}

const scatterData = Array.from({ length: 24 }).map((_, i) => ({
  x: 40 + i * 3 + (i % 3) * 6,
  y: 30 + i * 2.4 + ((i * 7) % 15),
}));

const coefficients = [
  { variable: "Superficie semée (ha)", coef: "+18,4", p: "0,002", sig: true },
  { variable: "Pluviométrie décadaire (mm)", coef: "+6,1", p: "0,011", sig: true },
  { variable: "Accès au crédit agricole", coef: "+142,7", p: "0,048", sig: true },
  { variable: "Satisfaction intrants", coef: "+22,3", p: "0,192", sig: false },
];

const annexTables = [
  { id: "A1", title: "Statistiques descriptives — Superficie semée (ha)", type: "Univariée", status: "auto", time: "10:42" },
  { id: "A2", title: "ANOVA — Filière suivie × Rendement estimé", type: "Bivariée", status: "adjusted", time: "10:47" },
  { id: "A3", title: "Corrélation de Spearman — Superficie semée × Pluviométrie", type: "Bivariée", status: "auto", time: "10:51" },
  { id: "A4", title: "Régression multiple — Modèle explicatif du rendement", type: "Multivariée", status: "auto", time: "10:58" },
];

const reportSections = [
  "1. Contexte de l'étude", "2. Objectifs", "3. Indicateurs de performance mesurés",
  "4. Méthodologie", "5. Résultats", "6. Analyse", "7. Recommandations", "8. Conclusion",
];

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

function ObjectiveGroup({ number, title, indicator, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed p-1" style={{ borderColor: "#D8C48A" }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: GOLD }}>
          {number}
        </div>
        <div>
          <div className="text-sm font-serif font-semibold" style={{ color: NAVY }}>{title}</div>
          <div className="text-[11px] text-gray-500">Indicateur suivi : {indicator}</div>
        </div>
      </div>
      <div className="space-y-3 px-1 pb-1">{children}</div>
    </div>
  );
}

function ClimateMap() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 relative rounded-xl bg-[#F7F9FC] border border-gray-100" style={{ height: 210 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {CLIMAT_COMMUNES.map((c) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r={7.5} fill={rainColor(c.mm)} opacity={0.88} />
              <circle cx={c.x} cy={c.y} r={7.5} fill="none" stroke="white" strokeWidth={0.6} />
              <text x={c.x} y={c.y - 10} fontSize="3.4" textAnchor="middle" fill="#4A5568" fontWeight="600">{c.name}</text>
              <text x={c.x} y={c.y + 1.2} fontSize="3" textAnchor="middle" fill="white" fontWeight="700">{c.mm}</text>
            </g>
          ))}
        </svg>
        <span className="absolute bottom-2 right-3 text-[9px] text-gray-400 italic">Interpolation IDW — illustrative</span>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <div className="text-[10px] font-medium text-gray-500 mb-1">Cumul pluviométrique décadaire (mm)</div>
        {[
          ["#C99A2E", "< 65 mm — déficitaire"],
          ["#8FAECB", "65 – 80 mm"],
          ["#4A7AB5", "80 – 95 mm"],
          ["#1F3864", "≥ 95 mm"],
        ].map(([color, label]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsReport({ active, onNavigate }) {
  const [sections, setSections] = useState(reportSections);
  const [format, setFormat] = useState("docx");

  const toggleSection = (s) =>
    setSections((prev) => (prev.includes(s) ? prev.filter((i) => i !== s) : [...prev, s]));

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <Watermark />
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-60 min-h-screen shrink-0 py-6 px-4 text-[#C7D2E8]"
          style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #16294B 100%)` }}>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: GOLD }}>
              <Sprout size={19} className="text-white" />
            </div>
            <div>
              <div className="font-serif font-bold text-white text-[16px] leading-none">AgriHakStat</div>
              <div className="text-[10px] opacity-60 mt-1">DDAEP-Borgou</div>
            </div>
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
              <p className="text-xs text-gray-500 mt-0.5">Suivi semis 2026-2027 · Décade 3 — 4 analyses exécutées</p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: NAVY }}>HM</div>
                <div className="leading-tight">
                  <div className="font-medium text-gray-800">H. Moussa</div>
                  <div className="text-[11px] text-gray-500">C/SESSEC</div>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </header>

          <main className="p-8 grid grid-cols-3 gap-6">
            {/* Résultats — organisés par objectif spécifique (section 5 du rapport) */}
            <div className="col-span-2 space-y-5">

              {/* Contexte climatique — Modules 7 & 8, mobilisé dans l'interprétation agronomique ci-dessous */}
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <CloudRain size={16} style={{ color: NAVY }} />
                  <h3 className="font-serif font-semibold text-sm" style={{ color: NAVY }}>Contexte climatique de la zone d'étude</h3>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Source : NASA POWER (Module 7) · Décade 3, juillet 2026 · Restitution cartographique (Module 8)</p>
                <ClimateMap />
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="rounded-xl p-2.5 text-center" style={{ background: NAVY_TINT }}>
                    <CloudRain size={14} className="mx-auto mb-1" style={{ color: NAVY }} />
                    <div className="text-[10px] text-gray-500">Cumul moyen zone</div>
                    <div className="text-sm font-bold" style={{ color: NAVY }}>83 mm</div>
                  </div>
                  <div className="rounded-xl p-2.5 text-center" style={{ background: NAVY_TINT }}>
                    <MapPin size={14} className="mx-auto mb-1" style={{ color: NAVY }} />
                    <div className="text-[10px] text-gray-500">Jours de pluie</div>
                    <div className="text-sm font-bold" style={{ color: NAVY }}>6 j</div>
                  </div>
                  <div className="rounded-xl p-2.5 text-center" style={{ background: NAVY_TINT }}>
                    <Thermometer size={14} className="mx-auto mb-1" style={{ color: NAVY }} />
                    <div className="text-[10px] text-gray-500">Température moy.</div>
                    <div className="text-sm font-bold" style={{ color: NAVY }}>27,4 °C</div>
                  </div>
                </div>
              </Card>

              <ObjectiveGroup
                number="1"
                title="Évaluer la progression des semis de coton sur la période de suivi"
                indicator="Taux de réalisation des semis / Superficie semée (ha)"
              >
                <Card>
                  <ResultHeader title="Superficie semée (ha) — statistiques descriptives" subtitle="Analyse univariée · Coton, Tchaourou & Pérèrè" status="auto" />
                  <div className="grid grid-cols-4 gap-3 text-center">
                    {[["Moyenne", "3,42 ha"], ["Médiane", "3,10 ha"], ["Écart-type", "1,08 ha"], ["CV", "31,6 %"]].map(([l, v]) => (
                      <div key={l} className="rounded-xl p-2.5" style={{ background: NAVY_TINT }}>
                        <div className="text-[10px] text-gray-500">{l}</div>
                        <div className="text-sm font-bold" style={{ color: NAVY }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <ResultHeader title="Superficie semée × Pluviométrie décadaire" subtitle="Analyse bivariée inférentielle · Corrélation de Spearman · ρ = 0,62, p = 0,003" status="auto" />
                  <ResponsiveContainer width="100%" height={170}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                      <XAxis dataKey="x" tick={{ fontSize: 11 }} stroke="#999" name="Pluviométrie" unit=" mm" />
                      <YAxis dataKey="y" tick={{ fontSize: 11 }} stroke="#999" name="Superficie" unit=" a" width={50} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={scatterData} fill={NAVY} />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Une association positive modérée est observée : les décades les plus arrosées coïncident avec une progression plus rapide des superficies semées.
                  </p>
                </Card>
              </ObjectiveGroup>

              <ObjectiveGroup
                number="2"
                title="Comparer la performance de rendement entre filières et en identifier les déterminants"
                indicator="Rendement estimé (kg/ha)"
              >
                <Card>
                  <ResultHeader title="Filière suivie × Rendement estimé" subtitle="Analyse bivariée inférentielle · ANOVA à un facteur · F = 4,82, p = 0,007, η² = 0,31" status="adjusted" />
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={rendementParFiliere}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                      <XAxis dataKey="filiere" tick={{ fontSize: 11 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#999" unit=" kg/ha" width={70} />
                      <Tooltip />
                      <Bar dataKey="moyenne" radius={[6, 6, 0, 0]}>
                        {rendementParFiliere.map((d) => (
                          <Cell key={d.filiere} fill={FILIERES[d.filiere]} />
                        ))}
                        <ErrorBar dataKey="ecart" width={4} strokeWidth={1.5} stroke="#7A7A7A" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Le rendement moyen diffère significativement selon la filière suivie (p &lt; 0,01). Le Manioc présente le rendement brut le plus élevé, en cohérence avec les référentiels agronomiques de la zone.
                  </p>
                </Card>

                <Card>
                  <ResultHeader title="Modèle explicatif du rendement" subtitle="Analyse multivariée · Régression linéaire multiple · R² = 0,58, R² ajusté = 0,54" status="auto" />
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-[10px] text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-2 font-medium">Variable explicative</th>
                        <th className="py-2 font-medium">Coefficient</th>
                        <th className="py-2 font-medium">p-valeur</th>
                        <th className="py-2 font-medium">Significativité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coefficients.map((c) => (
                        <tr key={c.variable} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-gray-800">{c.variable}</td>
                          <td className="py-2 text-gray-600">{c.coef}</td>
                          <td className="py-2 text-gray-600">{c.p}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={c.sig ? { background: GREEN_TINT, color: GREEN } : { background: "#EDEEF3", color: "#6B7280" }}>
                              {c.sig ? "Significatif" : "Non significatif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </ObjectiveGroup>

              {/* Section 6 — Analyse : lecture croisée + discussion contextualisée */}
              <Card className="border-2" style={{ borderColor: GOLD }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} style={{ color: GOLD }} />
                  <h3 className="font-serif font-semibold text-sm" style={{ color: NAVY }}>6. Analyse — lecture croisée des résultats</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  La carte pluviométrique confirme un déficit localisé sur Tchaourou et Pérèrè (58 et 61 mm cumulés, contre 83 mm en moyenne sur la zone), ce qui explique en grande partie le retard de semis constaté à l'Objectif 1 : ces deux communes affichent à la fois le cumul décadaire le plus faible et la progression des superficies semées la plus lente.
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  Ce déficit pluviométrique se répercute directement sur l'écart de rendement inter-filières mis en évidence par l'ANOVA (Objectif 2) : le coton, filière la plus sensible au calendrier pluviométrique décadaire et majoritairement cultivé sur ces deux communes déficitaires, affiche le rendement le plus faible de l'échantillon — la lecture croisée cartographie/statistiques permet ainsi de distinguer un effet climatique d'un effet propre à la filière.
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ce constat rejoint la littérature agro-climatique régionale sur la sensibilité des cultures pluviales aux régimes décadaires en zone soudano-guinéenne <em>(référence institutionnelle ou académique à documenter lors de la rédaction finale, conformément au standard APA 7 retenu)</em>, et suggère que l'accès au crédit agricole — variable significative du modèle de régression — constitue un levier d'atténuation partiel du risque climatique.
                </p>
              </Card>

              {/* Section 7 — Recommandations orientées décision */}
              <Card className="border-2" style={{ borderColor: "#3E9C6B" }}>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} style={{ color: GREEN }} />
                  <h3 className="font-serif font-semibold text-sm" style={{ color: NAVY }}>7. Recommandations</h3>
                </div>
                <ul className="text-xs text-gray-600 leading-relaxed space-y-1.5 list-disc pl-4">
                  <li>Prioriser l'appui-conseil et la distribution d'intrants coton sur les communes de Tchaourou et Pérèrè avant la décade 4, en réponse au retard de semis constaté.</li>
                  <li>Renforcer l'accès au crédit agricole en zone cotonnière, ce facteur ayant montré un effet significatif sur le rendement dans le modèle explicatif.</li>
                  <li>Intégrer un suivi pluviométrique décadaire systématique (Module 7) dans les prochains cycles de collecte, afin d'anticiper les écarts de calendrier cultural.</li>
                </ul>
              </Card>
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
                <p className="text-[11px] text-gray-400 mb-3">Tableaux consolidés automatiquement, horodatés (Module 6).</p>
                <div className="space-y-2">
                  {annexTables.map((t) => (
                    <div key={t.id} className="rounded-xl border border-gray-100 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold" style={{ color: NAVY }}>Tableau {t.id}</span>
                        <span className="text-[10px] text-gray-400">{t.time}</span>
                      </div>
                      <div className="text-[11px] text-gray-600 mt-0.5">{t.title}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: NAVY_TINT, color: NAVY }}>{t.type}</span>
                        <StatusBadge status={t.status} />
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
                <button className="w-full px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, #3E9C6B, ${GREEN})` }}>
                  <Layers size={14} /> Générer le rapport final
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
