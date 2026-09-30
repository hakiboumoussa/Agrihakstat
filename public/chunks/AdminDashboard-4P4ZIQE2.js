import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "./chunk-CBURJCWO.js";
import "./chunk-UAGJ44GB.js";
import {
  supabase
} from "./chunk-U3XLNF6K.js";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  Layers,
  Users,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// src/admin/AdminDashboard.jsx
var import_react = __toESM(require_react());
var NAVY = "#1F3864";
var GOLD = "#C99A2E";
var GREEN = "#256B45";
var GREEN_TINT = "#E4F5EC";
var AMBER_TINT = "#FDF1DA";
var SCREEN_LABELS = {
  dashboard: "Tableau de bord",
  import: "Assistant d'import",
  config: "Configuration des analyses",
  results: "R\xE9sultats & rapport",
  map: "Cartographie"
};
var THEME_COLORS = ["#1F3864", "#3E9C6B", "#C99A2E", "#3592C4", "#B5651D", "#6C7DAE", "#B3413A"];
function themeColor(i) {
  return THEME_COLORS[i % THEME_COLORS.length];
}
function AdminDashboard({ onBack }) {
  const [users, setUsers] = (0, import_react.useState)([]);
  const [activity, setActivity] = (0, import_react.useState)([]);
  const [projets, setProjets] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)("");
  const [selectedTheme, setSelectedTheme] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    async function load() {
      const { data: profiles, error: e1 } = await supabase.from("profiles").select("email, role, created_at").order("created_at", { ascending: false });
      const { data: logs, error: e2 } = await supabase.from("activity_log").select("screen");
      const { data: projs, error: e3 } = await supabase.from("projets").select("id, titre, thematiques, communes, statut, user_email, created_at").order("created_at", { ascending: false });
      if (e1 || e2 || e3) setError((e1 || e2 || e3).message);
      setUsers(profiles || []);
      setActivity(logs || []);
      setProjets(projs || []);
      setLoading(false);
    }
    load();
  }, []);
  const counts = {};
  activity.forEach((a) => {
    counts[a.screen] = (counts[a.screen] || 0) + 1;
  });
  const chartData = Object.entries(SCREEN_LABELS).map(([id, label]) => ({ label, visites: counts[id] || 0 }));
  const themeMap = {};
  projets.forEach((p) => {
    (p.thematiques && p.thematiques.length ? p.thematiques : ["Non renseign\xE9"]).forEach((t) => {
      if (!themeMap[t]) themeMap[t] = [];
      themeMap[t].push(p);
    });
  });
  const themes = Object.entries(themeMap).sort((a, b) => b[1].length - a[1].length);
  const themeProjects = selectedTheme ? themeMap[selectedTheme] || [] : [];
  const themeUsers = new Set(themeProjects.map((p) => p.user_email)).size;
  const themeLastDate = themeProjects[0]?.created_at;
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen bg-[#F4F6FB] font-sans p-8" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: selectedTheme ? () => setSelectedTheme(null) : onBack, className: "flex items-center gap-2 text-sm mb-6", style: { color: NAVY } }, /* @__PURE__ */ import_react.default.createElement(ArrowLeft, { size: 15 }), " ", selectedTheme ? "Retour aux th\xE9matiques" : "Retour \xE0 l'application"), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-4 mb-6 text-sm", style: { background: "#FBE7E5", color: "#B3413A" } }, error, ". V\xE9rifiez que le script supabase_setup.sql a bien \xE9t\xE9 ex\xE9cut\xE9 (y compris la table \xAB projets \xBB) et que votre compte a le r\xF4le \xAB admin \xBB."), loading ? /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-gray-400" }, "Chargement\u2026") : selectedTheme ? (
    /* ---------- VUE DÉTAIL D'UNE THÉMATIQUE ---------- */
    /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "w-3 h-3 rounded-full", style: { background: themeColor(themes.findIndex(([t]) => t === selectedTheme)) } }), /* @__PURE__ */ import_react.default.createElement("h1", { className: "font-serif text-2xl font-bold", style: { color: NAVY } }, "Th\xE9matique : ", selectedTheme)), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-gray-500 mb-6" }, "Point des projets soumis par les utilisateurs sur cette th\xE9matique"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-4 mb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement(FolderKanban, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-2xl font-bold mt-2", style: { color: NAVY } }, themeProjects.length), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Projets soumis")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement(Users, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-2xl font-bold mt-2", style: { color: NAVY } }, themeUsers), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Utilisateurs distincts")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement(Clock, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-2xl font-bold mt-2", style: { color: NAVY } }, themeLastDate ? new Date(themeLastDate).toLocaleDateString("fr-FR") : "\u2014"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Dernier d\xE9p\xF4t"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "px-5 py-4" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Projets soumis sur cette th\xE9matique")), /* @__PURE__ */ import_react.default.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ import_react.default.createElement("thead", null, /* @__PURE__ */ import_react.default.createElement("tr", { className: "text-left text-[11px] text-gray-400 uppercase border-t border-b border-gray-100" }, /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Objectif / Titre"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Soumis par"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Communes"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Statut"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-5 py-2 font-medium" }, "Date"))), /* @__PURE__ */ import_react.default.createElement("tbody", null, themeProjects.map((p) => /* @__PURE__ */ import_react.default.createElement("tr", { key: p.id, className: "border-b border-gray-50 last:border-0" }, /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3 text-gray-800 max-w-xs" }, p.titre), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3 text-gray-500" }, p.user_email), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3 text-gray-500" }, (p.communes || []).join(", ") || "\u2014"), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "px-2 py-1 rounded-full text-[11px] font-medium", style: { background: GREEN_TINT, color: GREEN } }, p.statut)), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-5 py-3 text-gray-400" }, new Date(p.created_at).toLocaleDateString("fr-FR")))), themeProjects.length === 0 && /* @__PURE__ */ import_react.default.createElement("tr", null, /* @__PURE__ */ import_react.default.createElement("td", { colSpan: 5, className: "px-5 py-6 text-center text-gray-400 text-xs" }, "Aucun projet sur cette th\xE9matique."))))))
  ) : (
    /* ---------- VUE D'ENSEMBLE ---------- */
    /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("h1", { className: "font-serif text-2xl font-bold mb-1", style: { color: NAVY } }, "Panneau d'administration"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-gray-500 mb-6" }, "Utilisateurs inscrits, fr\xE9quentation, et projets soumis par th\xE9matique"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-4 mb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement(Users, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-2xl font-bold mt-2", style: { color: NAVY } }, users.length), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Utilisateurs inscrits")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement(FolderKanban, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-2xl font-bold mt-2", style: { color: NAVY } }, projets.length), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Projets soumis au total")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement(Clock, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-2xl font-bold mt-2", style: { color: NAVY } }, users[0] ? new Date(users[0].created_at).toLocaleDateString("fr-FR") : "\u2014"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Derni\xE8re inscription"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5 mb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ import_react.default.createElement(Layers, { size: 16, style: { color: NAVY } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Projets soumis par th\xE9matique")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-4" }, "Cliquez sur une th\xE9matique pour ouvrir son tableau de bord de suivi."), themes.length === 0 ? /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400" }, "Aucun projet soumis pour l'instant.") : /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-3" }, themes.map(([theme, list], i) => {
      const distinctUsers = new Set(list.map((p) => p.user_email)).size;
      return /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          key: theme,
          onClick: () => setSelectedTheme(theme),
          className: "text-left rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow",
          style: { background: AMBER_TINT }
        },
        /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "w-2.5 h-2.5 rounded-full", style: { background: themeColor(i) } }), /* @__PURE__ */ import_react.default.createElement(ChevronRight, { size: 14, className: "text-gray-400" })),
        /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif font-semibold text-sm", style: { color: NAVY } }, theme),
        /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-500 mt-1" }, list.length, " projet", list.length > 1 ? "s" : "", " \xB7 ", distinctUsers, " utilisateur", distinctUsers > 1 ? "s" : "")
      );
    }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-3", style: { color: NAVY } }, "Fr\xE9quentation par \xE9cran"), /* @__PURE__ */ import_react.default.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ import_react.default.createElement(BarChart, { data: chartData, layout: "vertical", margin: { left: 40 } }, /* @__PURE__ */ import_react.default.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EDEDED" }), /* @__PURE__ */ import_react.default.createElement(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false }), /* @__PURE__ */ import_react.default.createElement(YAxis, { type: "category", dataKey: "label", tick: { fontSize: 11 }, width: 160 }), /* @__PURE__ */ import_react.default.createElement(Tooltip, null), /* @__PURE__ */ import_react.default.createElement(Bar, { dataKey: "visites", fill: NAVY, radius: [0, 6, 6, 0] })))), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white rounded-2xl p-5 shadow-sm border border-black/5" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-3", style: { color: NAVY } }, "Derniers inscrits"), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2 max-h-56 overflow-y-auto" }, users.slice(0, 8).map((u, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i, className: "text-xs border-b border-gray-50 pb-2" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "font-medium text-gray-700" }, u.email), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-gray-400" }, new Date(u.created_at).toLocaleDateString("fr-FR"), " \xB7 ", u.role))), users.length === 0 && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400" }, "Aucun utilisateur pour l'instant.")))))
  ));
}
export {
  AdminDashboard as default
};
