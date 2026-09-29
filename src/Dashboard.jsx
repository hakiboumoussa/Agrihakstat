import React from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, Plus, Upload, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, MoreHorizontal, Droplets, Sun, Leaf, MapPin,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import Sidebar from "./Sidebar.jsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

/* ---- Palette par filière (couleurs vives et distinctes) ---- */
const FILIERES = {
  Soja:   { color: "#3E9C6B", tint: "#E4F5EC" },
  Maïs:   { color: "#F0AC1B", tint: "#FDF1DA" },
  Riz:    { color: "#3592C4", tint: "#E3F1FA" },
  Manioc: { color: "#B5651D", tint: "#F6E9DD" },
  Coton:  { color: "#6C7DAE", tint: "#EBEEF7" },
};

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

export default function Dashboard({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
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

            {/* KPI cards colorées */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {kpis.map((kpi) => (
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
              {/* Chart multi-filières coloré */}
              <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Progression des semis par filière</h2>
                  <MoreHorizontal size={16} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mb-4">Taux de réalisation cumulé (%) par décade — toutes communes</p>
                <ResponsiveContainer width="100%" height={230}>
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
                </ResponsiveContainer>
                <div className="h-1 w-16 rounded-full mt-2" style={{ background: GOLD }} />
              </div>

              {/* Répartition par filière (donut coloré) */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Répartition des enquêtes</h2>
                <p className="text-xs text-gray-400 mb-2">Par filière — campagne en cours</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={repartition} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3}>
                      {repartition.map((entry) => (
                        <Cell key={entry.name} fill={FILIERES[entry.name].color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                  {repartition.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: FILIERES[entry.name].color }} />
                      {entry.name} · {entry.value}%
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alertes colorées */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3" style={{ borderColor: "#F0AC1B" }}>
                <AlertTriangle size={18} style={{ color: "#F0AC1B" }} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Coton — Pérèrè</div>
                  <div className="text-xs text-gray-500 mt-0.5">Taux de réalisation 62 %, sous le seuil décadaire (75 %)</div>
                </div>
              </div>
              <div className="rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3" style={{ borderColor: "#D9534F" }}>
                <Droplets size={18} style={{ color: "#D9534F" }} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Riz — Bembéréké</div>
                  <div className="text-xs text-gray-500 mt-0.5">Anomalie de saisie détectée sur 4 fiches</div>
                </div>
              </div>
              <div className="rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3" style={{ borderColor: "#3E9C6B" }}>
                <CheckCircle2 size={18} style={{ color: "#3E9C6B" }} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Maïs — N'Dali</div>
                  <div className="text-xs text-gray-500 mt-0.5">Objectif décadaire atteint</div>
                </div>
              </div>
            </div>

            {/* Enquêtes récentes */}
            <div className="bg-white rounded-2xl mt-4 overflow-hidden shadow-sm border border-black/5">
              <div className="px-5 py-4 flex items-center justify-between">
                <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Enquêtes récentes</h2>
                <Clock size={15} className="text-gray-400" />
              </div>
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
