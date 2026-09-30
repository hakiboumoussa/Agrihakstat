import {
  ChartColumn,
  ChevronDown,
  ClipboardList,
  CloudRain,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  Sparkles,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// src/UserMenu.jsx
var import_react = __toESM(require_react());
var NAVY = "#1F3864";
function UserMenu({ email, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const ref = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);
  const initials = isGuest ? "?" : (email || "").slice(0, 2).toUpperCase();
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "relative", ref }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setOpen((o) => !o), className: "flex items-center gap-2 text-sm" }, /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      className: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0",
      style: { background: NAVY }
    },
    initials
  ), /* @__PURE__ */ import_react.default.createElement("div", { className: "leading-tight text-left" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "font-medium text-gray-800 max-w-[140px] truncate" }, isGuest ? "Mode d\xE9monstration" : email), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-500" }, roleLabel)), /* @__PURE__ */ import_react.default.createElement(ChevronDown, { size: 14, className: `text-gray-400 transition-transform ${open ? "rotate-180" : ""}` })), open && /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50" }, isAdmin && /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => {
        setOpen(false);
        onOpenAdmin();
      },
      className: "w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50",
      style: { color: NAVY }
    },
    /* @__PURE__ */ import_react.default.createElement(ShieldCheck, { size: 14 }),
    " Panneau d'administration"
  ), isGuest ? /* @__PURE__ */ import_react.default.createElement("button", { onClick: onLogout, className: "w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50", style: { color: NAVY } }, /* @__PURE__ */ import_react.default.createElement(Sparkles, { size: 14 }), " Cr\xE9er un compte") : /* @__PURE__ */ import_react.default.createElement("button", { onClick: onLogout, className: "w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-red-500 hover:bg-gray-50" }, /* @__PURE__ */ import_react.default.createElement(LogOut, { size: 14 }), " Se d\xE9connecter")));
}

// src/Sidebar.jsx
var import_react2 = __toESM(require_react());
var NAVY2 = "#1F3864";
var GOLD = "#C99A2E";
var NAV_ITEMS = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: ChartColumn },
  { id: "results", label: "R\xE9sultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
  { id: "climate", label: "Climat", icon: CloudRain },
  { id: "settings", label: "Param\xE8tres", icon: Settings }
];
function Sidebar({ active, onNavigate, children }) {
  return /* @__PURE__ */ import_react2.default.createElement(
    "aside",
    {
      className: "w-60 min-h-screen shrink-0 py-6 px-4 text-[#C7D2E8] flex flex-col",
      style: { background: `linear-gradient(180deg, ${NAVY2} 0%, #16294B 100%)` }
    },
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col items-start gap-1 px-2 mb-8" }, /* @__PURE__ */ import_react2.default.createElement("img", { src: "./logo-compact.png", alt: "AgriHakStat", className: "h-32 w-auto -ml-1" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "text-[10px] opacity-60" }, "DDAEP-Borgou")),
    /* @__PURE__ */ import_react2.default.createElement("nav", { className: "space-y-1.5" }, NAV_ITEMS.map((item) => /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        key: item.id,
        onClick: () => onNavigate(item.id),
        className: `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${item.id === active ? "bg-[#16294B] text-white font-medium shadow-inner border-l-4" : "hover:bg-white/5"}`,
        style: item.id === active ? { borderColor: GOLD } : {}
      },
      /* @__PURE__ */ import_react2.default.createElement(item.icon, { size: 17 }),
      item.label
    ))),
    children
  );
}

export {
  UserMenu,
  Sidebar
};
