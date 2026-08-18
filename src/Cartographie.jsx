import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, MapPin, Layers, Droplets, Download, FileOutput, Filter,
} from "lucide-react";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

const FILIERES = {
  Soja: "#3E9C6B", Maïs: "#F0AC1B", Riz: "#3592C4", Manioc: "#B5651D", Coton: "#6C7DAE",
};

const nav = [
  { label: "Tableau de bord", icon: LayoutDashboard },
  { label: "Enquêtes", icon: ClipboardList },
  { label: "Analyses", icon: BarChart3 },
  { label: "Rapports", icon: FileText },
  { label: "Paramètres", icon: Settings },
];

// Positions relatives illustratives (mockup) des communes du Borgou
const COMMUNES = [
  { name: "Sinendé", x: 30, y: 8, mm: 108, taux: 84, rendement: 1720, anomalies: 0 },
  { name: "Kalalé", x: 68, y: 13, mm: 101, taux: 79, rendement: 1650, anomalies: 1 },
  { name: "Bembéréké", x: 42, y: 29, mm: 95, taux: 88, rendement: 1810, anomalies: 0 },
  { name: "N'Dali", x: 16, y: 47, mm: 84, taux: 91, rendement: 1900, anomalies: 0 },
  { name: "Pérèrè", x: 66, y: 41, mm: 61, taux: 62, rendement: 1120, anomalies: 2 },
  { name: "Parakou", x: 40, y: 54, mm: 76, taux: 86, rendement: 1780, anomalies: 0 },
  { name: "Nikki", x: 70, y: 61, mm: 89, taux: 83, rendement: 1690, anomalies: 1 },
  { name: "Tchaourou", x: 32, y: 81, mm: 58, taux: 58, rendement: 1080, anomalies: 4 },
];

// Points d'enquête individuels, dispersés autour de chaque commune
const SURVEY_POINTS = COMMUNES.flatMap((c, ci) =>
  Array.from({ length: 4 }).map((_, i) => {
    const filieres = Object.keys(FILIERES);
    return {
      id: `${c.name}-${i}`,
      x: c.x + (((ci + i) % 5) - 2) * 3.2,
      y: c.y + (((ci * 3 + i) % 5) - 2) * 3.2,
      filiere: filieres[(ci + i) % filieres.length],
    };
  })
);

function rainColor(mm) {
  if (mm < 65) return "#C99A2E";
  if (mm < 80) return "#8FAECB";
  if (mm < 95) return "#4A7AB5";
  return "#1F3864";
}

function tauxColor(taux) {
  if (taux < 65) return "#C1573F";
  if (taux < 80) return "#E3A23B";
  return "#3E9C6B";
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

function LayerButton({ label, icon: Icon, active, onClick }) {
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

function Chip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
      style={active ? { background: color || NAVY, borderColor: color || NAVY, color: "white" } : { background: "white", borderColor: "#D8DEE9", color: "#5A6478" }}
    >
      {label}
    </button>
  );
}

export default function Cartographie() {
  const [layer, setLayer] = useState("points");
  const [indicateur, setIndicateur] = useState("taux");
  const [filieres, setFilieres] = useState(Object.keys(FILIERES));

  const toggleFiliere = (f) =>
    setFilieres((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const indicateurLabel = { taux: "Taux de réalisation (%)", rendement: "Rendement moyen (kg/ha)", anomalies: "Anomalies détectées" }[indicateur];
  const indicateurValue = (c) => (indicateur === "taux" ? `${c.taux}%` : indicateur === "rendement" ? `${c.rendement}` : c.anomalies);
  const indicateurColor = (c) => (indicateur === "anomalies" ? (c.anomalies > 1 ? "#C1573F" : c.anomalies === 1 ? "#E3A23B" : "#3E9C6B") : indicateur === "taux" ? tauxColor(c.taux) : tauxColor((c.rendement / 2000) * 100));

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
              <div key={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                  item.active ? "bg-[#16294B] text-white font-medium border-l-4" : "hover:bg-white/5"
                }`}
                style={item.active ? { borderColor: GOLD } : {}}>
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
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Cartographie</h1>
              <p className="text-xs text-gray-500 mt-0.5">Module 8 · Suivi semis 2026-2027 — Décade 3, Borgou</p>
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
            {/* Carte */}
            <div className="col-span-2">
              <div className="flex gap-2 mb-4">
                <LayerButton label="Points d'enquête" icon={MapPin} active={layer === "points"} onClick={() => setLayer("points")} />
                <LayerButton label="Choroplèthe indicateurs" icon={Layers} active={layer === "choropleth"} onClick={() => setLayer("choropleth")} />
                <LayerButton label="Isohyètes pluviométriques" icon={Droplets} active={layer === "isohyet"} onClick={() => setLayer("isohyet")} />
              </div>

              <Card>
                {layer === "choropleth" && (
                  <div className="flex items-center gap-2 mb-4">
                    <Filter size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Indicateur :</span>
                    <select value={indicateur} onChange={(e) => setIndicateur(e.target.value)}
                      className="text-xs rounded-lg border border-gray-200 p-1.5 bg-white focus:outline-none">
                      <option value="taux">Taux de réalisation (%)</option>
                      <option value="rendement">Rendement moyen (kg/ha)</option>
                      <option value="anomalies">Anomalies détectées</option>
                    </select>
                  </div>
                )}

                <div className="relative rounded-xl bg-[#F7F9FC] border border-gray-100" style={{ height: 460 }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {layer === "points" && SURVEY_POINTS
                      .filter((pt) => filieres.includes(pt.filiere))
                      .map((pt) => (
                        <circle key={pt.id} cx={pt.x} cy={pt.y} r={1.6} fill={FILIERES[pt.filiere]} opacity={0.85} stroke="white" strokeWidth={0.3} />
                      ))}

                    {layer === "choropleth" && COMMUNES.map((c) => (
                      <g key={c.name}>
                        <circle cx={c.x} cy={c.y} r={9} fill={indicateurColor(c)} opacity={0.88} />
                        <circle cx={c.x} cy={c.y} r={9} fill="none" stroke="white" strokeWidth={0.6} />
                        <text x={c.x} y={c.y - 12} fontSize="3.4" textAnchor="middle" fill="#4A5568" fontWeight="600">{c.name}</text>
                        <text x={c.x} y={c.y + 1.2} fontSize="3" textAnchor="middle" fill="white" fontWeight="700">{indicateurValue(c)}</text>
                      </g>
                    ))}

                    {layer === "isohyet" && COMMUNES.map((c) => (
                      <g key={c.name}>
                        <circle cx={c.x} cy={c.y} r={11} fill={rainColor(c.mm)} opacity={0.25} />
                        <circle cx={c.x} cy={c.y} r={7} fill={rainColor(c.mm)} opacity={0.9} />
                        <circle cx={c.x} cy={c.y} r={7} fill="none" stroke="white" strokeWidth={0.6} />
                        <text x={c.x} y={c.y - 13} fontSize="3.4" textAnchor="middle" fill="#4A5568" fontWeight="600">{c.name}</text>
                        <text x={c.x} y={c.y + 1.2} fontSize="3" textAnchor="middle" fill="white" fontWeight="700">{c.mm}</text>
                      </g>
                    ))}
                  </svg>
                  <span className="absolute bottom-2 right-3 text-[9px] text-gray-400 italic">
                    {layer === "isohyet" ? "Interpolation IDW — illustrative" : "Position illustrative — non géoréférencée à l'échelle"}
                  </span>
                </div>

                {/* Légendes */}
                {layer === "points" && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {Object.entries(FILIERES).map(([f, c]) => (
                      <div key={f} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /> {f}
                      </div>
                    ))}
                  </div>
                )}
                {layer === "choropleth" && (
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-[11px] text-gray-500">{indicateurLabel} :</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#C1573F" }} /> Faible</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E3A23B" }} /> Intermédiaire</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3E9C6B" }} /> Satisfaisant</div>
                  </div>
                )}
                {layer === "isohyet" && (
                  <div className="flex items-center gap-4 mt-4 flex-wrap">
                    <span className="text-[11px] text-gray-500">Cumul décadaire (mm) :</span>
                    {[["#C99A2E", "< 65"], ["#8FAECB", "65–80"], ["#4A7AB5", "80–95"], ["#1F3864", "≥ 95"]].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-1.5 text-[11px] text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /> {l}</div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Filtres et export */}
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Filtres</h2>
                </div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Filière</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(FILIERES).map(([f, c]) => (
                    <Chip key={f} label={f} active={filieres.includes(f)} onClick={() => toggleFiliere(f)} color={c} />
                  ))}
                </div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Période</label>
                <select className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }}>
                  <option>Décade 3 — Juillet 2026</option>
                  <option>Décade 2 — Juillet 2026</option>
                  <option>Décade 1 — Juillet 2026</option>
                </select>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Communes en alerte</h2>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Selon l'indicateur actuellement affiché</p>
                <div className="space-y-2">
                  {COMMUNES.filter((c) => c.taux < 70 || c.anomalies > 1).map((c) => (
                    <div key={c.name} className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5">
                      <span className="text-xs font-medium text-gray-700">{c.name}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FBE7E5", color: "#B3413A" }}>
                        {c.taux}% réalisé
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <FileOutput size={16} style={{ color: GOLD }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Export</h2>
                </div>
                <button className="w-full mb-2 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 bg-white border"
                  style={{ borderColor: NAVY, color: NAVY }}>
                  <Download size={14} /> Exporter la carte (PNG)
                </button>
                <button className="w-full px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                  <Layers size={14} /> Intégrer au rapport (Résultats)
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
