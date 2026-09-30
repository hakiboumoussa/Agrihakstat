import {
  ChartExportButton
} from "./chunk-JQ22GYUN.js";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "./chunk-CBURJCWO.js";
import "./chunk-UAGJ44GB.js";
import {
  Sidebar,
  UserMenu
} from "./chunk-FYJTF33N.js";
import {
  Bell,
  CircleCheck,
  ClipboardList,
  Clock,
  Droplets,
  Ellipsis,
  FileText,
  Plus,
  Sun,
  TrendingUp,
  TriangleAlert,
  Upload,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// src/Dashboard.jsx
var import_react = __toESM(require_react());
var FILIERES = {
  Soja: { color: "#3E9C6B", tint: "#E4F5EC" },
  Ma\u00EFs: { color: "#F0AC1B", tint: "#FDF1DA" },
  Riz: { color: "#3592C4", tint: "#E3F1FA" },
  Manioc: { color: "#B5651D", tint: "#F6E9DD" },
  Coton: { color: "#6C7DAE", tint: "#EBEEF7" }
};
var growthData = [
  { decade: "D1 Juin", Soja: 10, "Ma\xEFs": 14, Riz: 9, Manioc: 6, Coton: 12 },
  { decade: "D2 Juin", Soja: 24, "Ma\xEFs": 29, Riz: 20, Manioc: 15, Coton: 27 },
  { decade: "D3 Juin", Soja: 38, "Ma\xEFs": 44, Riz: 33, Manioc: 26, Coton: 41 },
  { decade: "D1 Juil", Soja: 55, "Ma\xEFs": 61, Riz: 48, Manioc: 40, Coton: 58 },
  { decade: "D2 Juil", Soja: 70, "Ma\xEFs": 77, Riz: 63, Manioc: 54, Coton: 74 },
  { decade: "D3 Juil", Soja: 84, "Ma\xEFs": 88, Riz: 76, Manioc: 68, Coton: 81 }
];
var repartition = [
  { name: "Coton", value: 32 },
  { name: "Ma\xEFs", value: 26 },
  { name: "Riz", value: 18 },
  { name: "Soja", value: 14 },
  { name: "Manioc", value: 10 }
];
var surveys = [
  { name: "Suivi semis 2026-2027 \u2014 D\xE9cade 3", filiere: "Coton", commune: "Tchaourou", status: "En cours", date: "20 juil. 2026" },
  { name: "Enqu\xEAte post-r\xE9colte Ma\xEFs", filiere: "Ma\xEFs", commune: "N'Dali", status: "Termin\xE9", date: "12 juil. 2026" },
  { name: "Suivi campagne Riz irrigu\xE9", filiere: "Riz", commune: "Bemb\xE9r\xE9k\xE9", status: "Brouillon", date: "08 juil. 2026" },
  { name: "Enqu\xEAte m\xE9nages Manioc", filiere: "Manioc", commune: "Nikki", status: "En cours", date: "02 juil. 2026" }
];
var statusColors = {
  "En cours": "bg-[#FDF1DA] text-[#8A5A00]",
  "Termin\xE9": "bg-[#E4F5EC] text-[#256B45]",
  "Brouillon": "bg-[#EDEEF3] text-[#525A72]"
};
var kpis = [
  { label: "Enqu\xEAtes actives", value: "7", note: "3 fili\xE8res suivies", icon: ClipboardList, tint: "#EBEEF7", fg: "#1F3864" },
  { label: "Taux moyen de r\xE9alisation", value: "81 %", note: "D\xE9cade 3 \u2014 Juillet", icon: TrendingUp, tint: "#E4F5EC", fg: "#256B45" },
  { label: "Indicateurs sous seuil", value: "2", note: "Coton \u2014 Tchaourou, P\xE9r\xE8r\xE8", icon: TriangleAlert, tint: "#FDF1DA", fg: "#8A5A00" },
  { label: "Rapports g\xE9n\xE9r\xE9s", value: "14", note: "Depuis le 1er juillet", icon: FileText, tint: "#F6E9DD", fg: "#8A4A1D" }
];
var NAVY = "#1F3864";
var GOLD = "#C99A2E";
function Watermark() {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center" }, /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "font-serif font-black whitespace-nowrap select-none",
      style: { color: NAVY, opacity: 0.06, fontSize: "13vw", letterSpacing: "-0.02em" }
    },
    "AgriHakStat"
  ), /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "absolute bottom-4 right-6 text-xs font-medium select-none",
      style: { color: NAVY, opacity: 0.35 }
    },
    "Con\xE7u par Hakibou MOUSSA"
  ));
}
function Dashboard({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const growthChartRef = (0, import_react.useRef)(null);
  const repartitionChartRef = (0, import_react.useRef)(null);
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans" }, /* @__PURE__ */ import_react.default.createElement(Watermark, null), /* @__PURE__ */ import_react.default.createElement("div", { className: "relative z-10 flex" }, /* @__PURE__ */ import_react.default.createElement(Sidebar, { active, onNavigate }, /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-10 mx-2 p-4 rounded-xl bg-white/5 border border-white/10" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ import_react.default.createElement(Sun, { size: 15, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-xs font-medium text-white" }, "Saison des pluies")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-[11px] leading-relaxed opacity-70" }, "Pic pluviom\xE9trique attendu semaine du 10 ao\xFBt sur Tchaourou et P\xE9r\xE8r\xE8."))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 min-h-screen" }, /* @__PURE__ */ import_react.default.createElement(
    "header",
    {
      className: "bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between",
      style: { borderBottom: `2px solid ${GOLD}` }
    },
    /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", { className: "font-serif text-xl font-bold", style: { color: NAVY } }, "Tableau de bord"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-500 mt-0.5" }, "Campagne agricole 2026\u20132027 \xB7 P\xF4le de D\xE9veloppement Agricole n\xB04")),
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
  ), /* @__PURE__ */ import_react.default.createElement("main", { className: "p-8" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex gap-3 mb-6" }, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => onNavigate("import"),
      className: "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-white shadow-md hover:shadow-lg transition-shadow",
      style: { background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }
    },
    /* @__PURE__ */ import_react.default.createElement(Plus, { size: 15 }),
    " Nouvelle enqu\xEAte"
  ), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => onNavigate("import"),
      className: "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow bg-white",
      style: { border: `1.5px solid ${GOLD}`, color: "#8A5A00" }
    },
    /* @__PURE__ */ import_react.default.createElement(Upload, { size: 15 }),
    " Importer questionnaire + base"
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-4 gap-4 mb-6" }, kpis.map((kpi) => /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      key: kpi.label,
      className: "relative rounded-2xl p-4 overflow-hidden shadow-sm border border-black/5",
      style: { background: kpi.tint }
    },
    /* @__PURE__ */ import_react.default.createElement(kpi.icon, { size: 64, style: { color: kpi.fg, opacity: 0.08 }, className: "absolute -right-3 -bottom-3" }),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "relative flex items-center justify-between mb-3" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-xs font-medium", style: { color: kpi.fg, opacity: 0.85 } }, kpi.label), /* @__PURE__ */ import_react.default.createElement(kpi.icon, { size: 16, style: { color: kpi.fg } })),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "relative font-serif text-2xl font-bold", style: { color: kpi.fg } }, kpi.value),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "relative text-[11px] mt-1", style: { color: kpi.fg, opacity: 0.65 } }, kpi.note)
  ))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Progression des semis par fili\xE8re"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(ChartExportButton, { targetRef: growthChartRef, filename: "Progression_semis_par_filiere" }), /* @__PURE__ */ import_react.default.createElement(Ellipsis, { size: 16, className: "text-gray-400" }))), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-4" }, "Taux de r\xE9alisation cumul\xE9 (%) par d\xE9cade \u2014 toutes communes"), /* @__PURE__ */ import_react.default.createElement("div", { ref: growthChartRef }, /* @__PURE__ */ import_react.default.createElement(ResponsiveContainer, { width: "100%", height: 230 }, /* @__PURE__ */ import_react.default.createElement(LineChart, { data: growthData }, /* @__PURE__ */ import_react.default.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EDEDED" }), /* @__PURE__ */ import_react.default.createElement(XAxis, { dataKey: "decade", tick: { fontSize: 11 }, stroke: "#999" }), /* @__PURE__ */ import_react.default.createElement(YAxis, { tick: { fontSize: 11 }, stroke: "#999", unit: "%" }), /* @__PURE__ */ import_react.default.createElement(Tooltip, null), /* @__PURE__ */ import_react.default.createElement(Legend, { wrapperStyle: { fontSize: 11 } }), Object.entries(FILIERES).map(([key, val]) => /* @__PURE__ */ import_react.default.createElement(Line, { key, type: "monotone", dataKey: key, stroke: val.color, strokeWidth: 2.5, dot: { r: 3 } }))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "h-1 w-16 rounded-full mt-2", style: { background: GOLD } })), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "R\xE9partition des enqu\xEAtes"), /* @__PURE__ */ import_react.default.createElement(ChartExportButton, { targetRef: repartitionChartRef, filename: "Repartition_enquetes_par_filiere" })), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-2" }, "Par fili\xE8re \u2014 campagne en cours"), /* @__PURE__ */ import_react.default.createElement("div", { ref: repartitionChartRef }, /* @__PURE__ */ import_react.default.createElement(ResponsiveContainer, { width: "100%", height: 160 }, /* @__PURE__ */ import_react.default.createElement(PieChart, null, /* @__PURE__ */ import_react.default.createElement(Pie, { data: repartition, dataKey: "value", nameKey: "name", innerRadius: 38, outerRadius: 62, paddingAngle: 3 }, repartition.map((entry) => /* @__PURE__ */ import_react.default.createElement(Cell, { key: entry.name, fill: FILIERES[entry.name].color }))), /* @__PURE__ */ import_react.default.createElement(Tooltip, null)))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2" }, repartition.map((entry) => /* @__PURE__ */ import_react.default.createElement("div", { key: entry.name, className: "flex items-center gap-1.5 text-[11px] text-gray-600" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "w-2.5 h-2.5 rounded-full", style: { background: FILIERES[entry.name].color } }), entry.name, " \xB7 ", entry.value, "%"))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-4 mt-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3", style: { borderColor: "#F0AC1B" } }, /* @__PURE__ */ import_react.default.createElement(TriangleAlert, { size: 18, style: { color: "#F0AC1B" }, className: "mt-0.5" }), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-medium text-gray-800" }, "Coton \u2014 P\xE9r\xE8r\xE8"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-500 mt-0.5" }, "Taux de r\xE9alisation 62 %, sous le seuil d\xE9cadaire (75 %)"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3", style: { borderColor: "#D9534F" } }, /* @__PURE__ */ import_react.default.createElement(Droplets, { size: 18, style: { color: "#D9534F" }, className: "mt-0.5" }), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-medium text-gray-800" }, "Riz \u2014 Bemb\xE9r\xE9k\xE9"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-500 mt-0.5" }, "Anomalie de saisie d\xE9tect\xE9e sur 4 fiches"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-2xl p-4 shadow-sm border-l-4 bg-white flex items-start gap-3", style: { borderColor: "#3E9C6B" } }, /* @__PURE__ */ import_react.default.createElement(CircleCheck, { size: 18, style: { color: "#3E9C6B" }, className: "mt-0.5" }), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-medium text-gray-800" }, "Ma\xEFs \u2014 N'Dali"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-500 mt-0.5" }, "Objectif d\xE9cadaire atteint")))), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl mt-4 overflow-hidden shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "px-5 py-4 flex items-center justify-between" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Enqu\xEAtes r\xE9centes"), /* @__PURE__ */ import_react.default.createElement(Clock, { size: 15, className: "text-gray-400" })), /* @__PURE__ */ import_react.default.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ import_react.default.createElement("thead", null, /* @__PURE__ */ import_react.default.createElement("tr", { className: "text-left text-[11px] text-gray-400 uppercase border-t border-b border-gray-100" }, /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Enqu\xEAte"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Fili\xE8re"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Commune"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Statut"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Date"))), /* @__PURE__ */ import_react.default.createElement("tbody", null, surveys.map((s) => /* @__PURE__ */ import_react.default.createElement("tr", { key: s.name, className: "border-b border-gray-50 last:border-0" }, /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3 text-gray-800" }, s.name), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "inline-flex items-center gap-1.5 text-gray-600" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "w-2 h-2 rounded-full", style: { background: FILIERES[s.filiere].color } }), s.filiere)), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3 text-gray-500" }, s.commune), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3" }, /* @__PURE__ */ import_react.default.createElement("span", { className: `px-2 py-1 rounded-full text-[11px] font-medium ${statusColors[s.status]}` }, s.status)), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3 text-gray-400" }, s.date))))))))));
}
export {
  Dashboard as default
};
