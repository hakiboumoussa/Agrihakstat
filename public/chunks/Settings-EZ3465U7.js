import {
  supabase
} from "./chunk-U3XLNF6K.js";
import {
  Sidebar,
  UserMenu
} from "./chunk-FYJTF33N.js";
import {
  Bell,
  CircleAlert,
  CircleCheck,
  CircleQuestionMark,
  FileText,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  User,
  Users,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// src/Settings.jsx
var import_react = __toESM(require_react());
var NAVY = "#1F3864";
var GOLD = "#C99A2E";
var GREEN = "#256B45";
var CONTACT_EMAIL = "hakiboumoussa@gmail.com";
function Card({ children, className = "" }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}` }, children);
}
var TABS = [
  { id: "compte", label: "Mon compte", icon: User },
  { id: "confidentialite", label: "Confidentialit\xE9", icon: ShieldCheck },
  { id: "conditions", label: "Conditions d'utilisation", icon: FileText },
  { id: "guide", label: "Guide d'utilisation", icon: CircleQuestionMark },
  { id: "contact", label: "Contact & bugs", icon: Mail }
];
function Settings({ active, onNavigate, userEmail, userId, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const [tab, setTab] = (0, import_react.useState)("compte");
  const tabs = isAdmin ? [...TABS, { id: "admin", label: "Administration", icon: Users }] : TABS;
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex" }, /* @__PURE__ */ import_react.default.createElement(Sidebar, { active, onNavigate }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 min-h-screen" }, /* @__PURE__ */ import_react.default.createElement(
    "header",
    {
      className: "bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between",
      style: { borderBottom: `2px solid ${GOLD}` }
    },
    /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", { className: "font-serif text-xl font-bold", style: { color: NAVY } }, "Param\xE8tres"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-500 mt-0.5" }, "Compte, confidentialit\xE9 et assistance")),
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
  ), /* @__PURE__ */ import_react.default.createElement("main", { className: "p-8 grid grid-cols-4 gap-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1.5" }, tabs.map((t) => /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      key: t.id,
      onClick: () => setTab(t.id),
      className: "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors",
      style: tab === t.id ? { background: NAVY, color: "white" } : { color: "#5A6478" }
    },
    /* @__PURE__ */ import_react.default.createElement(t.icon, { size: 15 }),
    " ",
    t.label
  ))), /* @__PURE__ */ import_react.default.createElement("div", { className: "col-span-3" }, tab === "compte" && /* @__PURE__ */ import_react.default.createElement(AccountTab, { userEmail, roleLabel, isGuest }), tab === "confidentialite" && /* @__PURE__ */ import_react.default.createElement(PrivacyTab, null), tab === "conditions" && /* @__PURE__ */ import_react.default.createElement(TermsTab, null), tab === "guide" && /* @__PURE__ */ import_react.default.createElement(GuideTab, null), tab === "contact" && /* @__PURE__ */ import_react.default.createElement(ContactTab, { userEmail, userId, isGuest }), tab === "admin" && isAdmin && /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react.default.createElement(AdminSettingsTab, { currentUserId: userId }), /* @__PURE__ */ import_react.default.createElement(AppSettingsEditor, null), /* @__PURE__ */ import_react.default.createElement(BugReportsList, null)))))));
}
function AccountTab({ userEmail, roleLabel, isGuest }) {
  const [password, setPassword] = (0, import_react.useState)("");
  const [confirm, setConfirm] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)("");
  const [done, setDone] = (0, import_react.useState)(false);
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);
    if (isGuest) {
      setError("Cr\xE9ez un compte pour g\xE9rer un mot de passe.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caract\xE8res.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error: error2 } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error2) setError(error2.message);
    else {
      setDone(true);
      setPassword("");
      setConfirm("");
    }
  };
  return /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-4", style: { color: NAVY } }, "Mon compte"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-4 mb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3", style: { background: "#EBEEF7" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[10px] text-gray-500" }, "Adresse e-mail"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-medium", style: { color: NAVY } }, isGuest ? "Mode d\xE9monstration" : userEmail)), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3", style: { background: "#EBEEF7" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[10px] text-gray-500" }, "R\xF4le"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-medium", style: { color: NAVY } }, roleLabel))), /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-sm font-semibold mb-2", style: { color: NAVY } }, "Changer de mot de passe"), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-2 rounded-xl p-3 mb-3 text-xs", style: { background: "#FBE7E5", color: "#B3413A" } }, /* @__PURE__ */ import_react.default.createElement(CircleAlert, { size: 14, className: "mt-0.5 shrink-0" }), " ", error), done && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 rounded-xl p-3 mb-3 text-xs", style: { background: "#E4F5EC", color: GREEN } }, /* @__PURE__ */ import_react.default.createElement(CircleCheck, { size: 14 }), " Mot de passe mis \xE0 jour avec succ\xE8s."), /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: handleChangePassword, className: "space-y-3 max-w-sm" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "password",
      placeholder: "Nouveau mot de passe",
      value: password,
      onChange: (e) => setPassword(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "password",
      placeholder: "Confirmer le mot de passe",
      value: confirm,
      onChange: (e) => setConfirm(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "submit",
      disabled: loading,
      className: "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-white shadow-md",
      style: { background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }
    },
    loading && /* @__PURE__ */ import_react.default.createElement(LoaderCircle, { size: 15, className: "animate-spin" }),
    " ",
    /* @__PURE__ */ import_react.default.createElement(KeyRound, { size: 14 }),
    " Mettre \xE0 jour"
  )));
}
function PrivacyTab() {
  return /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-3", style: { color: NAVY } }, "Politique de confidentialit\xE9"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-600 leading-relaxed space-y-3" }, /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "Donn\xE9es collect\xE9es."), " AgriHakStat collecte votre adresse e-mail (cr\xE9ation de compte), les fichiers de questionnaire et de base de donn\xE9es que vous importez volontairement, le contexte de vos \xE9tudes (objectifs, indicateurs, zones g\xE9ographiques), ainsi que des donn\xE9es d'usage anonymis\xE9es (\xE9crans consult\xE9s) \xE0 des fins d'am\xE9lioration du service."), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "H\xE9bergement et sous-traitance."), " Les comptes et donn\xE9es sont h\xE9berg\xE9s par Supabase (base de donn\xE9es PostgreSQL et authentification) et le site est servi par Vercel. Aucune donn\xE9e n'est vendue ni partag\xE9e avec des tiers \xE0 des fins commerciales."), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "Vos droits."), " Vous pouvez \xE0 tout moment demander l'acc\xE8s, la rectification ou la suppression de vos donn\xE9es en \xE9crivant \xE0 l'adresse indiqu\xE9e dans l'onglet Contact. Vous pouvez \xE9galement supprimer vos bases de donn\xE9es import\xE9es directement depuis l'assistant d'import."), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "S\xE9curit\xE9."), " L'acc\xE8s \xE0 vos propres donn\xE9es est prot\xE9g\xE9 par une politique de s\xE9curit\xE9 au niveau des lignes (Row Level Security) : seul vous-m\xEAme, et l'administrateur de votre structure pour les besoins de suivi institutionnel, pouvez consulter vos projets soumis."), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-gray-400 italic" }, "Ce document est une version de travail, destin\xE9e \xE0 \xEAtre r\xE9vis\xE9e avec un conseil juridique avant toute mise en production \xE0 grande \xE9chelle.")));
}
function TermsTab() {
  return /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-3", style: { color: NAVY } }, "Conditions d'utilisation"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-600 leading-relaxed space-y-3" }, /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "Objet."), " AgriHakStat est un outil d'aide \xE0 l'analyse statistique d'enqu\xEAtes agricoles. Les tests statistiques propos\xE9s automatiquement sont des recommandations m\xE9thodologiques ; leur validation reste sous la responsabilit\xE9 de l'analyste."), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "Propri\xE9t\xE9 des donn\xE9es."), " Les donn\xE9es que vous importez vous appartiennent. AgriHakStat ne revendique aucun droit de propri\xE9t\xE9 sur vos bases de donn\xE9es, vos r\xE9sultats ou vos rapports."), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "Usage acceptable."), " Vous vous engagez \xE0 ne pas importer de donn\xE9es \xE0 caract\xE8re personnel sensible sans base l\xE9gale appropri\xE9e, et \xE0 utiliser les r\xE9sultats g\xE9n\xE9r\xE9s avec le discernement scientifique requis avant toute d\xE9cision op\xE9rationnelle."), /* @__PURE__ */ import_react.default.createElement("p", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "Limitation de responsabilit\xE9."), " Les analyses, y compris celles r\xE9dig\xE9es avec l'assistance d'une intelligence artificielle, sont fournies \xE0 titre d'aide \xE0 la d\xE9cision et ne sauraient se substituer au jugement professionnel de l'analyste."), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-gray-400 italic" }, "Version de travail \u2014 \xE0 faire r\xE9viser juridiquement avant diffusion publique.")));
}
function GuideTab() {
  const steps = [
    ["Assistant d'import", "Importez votre questionnaire et votre base de donn\xE9es (.xlsx ou .csv), d\xE9finissez le contexte de l'\xE9tude et vos indicateurs de performance."],
    ["Configuration des analyses", "S\xE9lectionnez des variables ou laissez Claude proposer des croisements pertinents ; validez le test statistique et ses conditions d'application."],
    ["R\xE9sultats & rapport", "Consultez les r\xE9sultats r\xE9ellement calcul\xE9s, validez ceux \xE0 inclure, faites r\xE9diger l'analyse par Claude, puis exportez en Word."],
    ["Cartographie", "Visualisez la localisation r\xE9elle de vos donn\xE9es si des colonnes de g\xE9olocalisation sont d\xE9tect\xE9es."]
  ];
  return /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-4", style: { color: NAVY } }, "Guide d'utilisation rapide"), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-4" }, steps.map(([title, text], i) => /* @__PURE__ */ import_react.default.createElement("div", { key: title, className: "flex gap-3" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", style: { background: GOLD } }, i + 1), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-semibold", style: { color: NAVY } }, title), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-500 mt-0.5" }, text))))));
}
function ContactTab({ userEmail, userId, isGuest }) {
  const [sujet, setSujet] = (0, import_react.useState)("");
  const [message, setMessage] = (0, import_react.useState)("");
  const [sending, setSending] = (0, import_react.useState)(false);
  const [sent, setSent] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);
    if (isGuest) {
      setError("Cr\xE9ez un compte pour envoyer un signalement suivi ; vous pouvez sinon \xE9crire directement par e-mail ci-dessous.");
      return;
    }
    if (!sujet.trim() || !message.trim()) {
      setError("Merci de renseigner un sujet et un message.");
      return;
    }
    setSending(true);
    const { error: error2 } = await supabase.from("bug_reports").insert({ user_id: userId, user_email: userEmail, sujet, message });
    setSending(false);
    if (error2) setError(error2.message);
    else {
      setSent(true);
      setSujet("");
      setMessage("");
    }
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-3", style: { color: NAVY } }, "Signaler un probl\xE8me"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-500 mb-4" }, "D\xE9crivez l'\xE9cran concern\xE9 et les \xE9tapes pour reproduire le probl\xE8me. Votre signalement est transmis directement \xE0 l'administrateur."), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-2 rounded-xl p-3 mb-3 text-xs", style: { background: "#FBE7E5", color: "#B3413A" } }, /* @__PURE__ */ import_react.default.createElement(CircleAlert, { size: 14, className: "mt-0.5 shrink-0" }), " ", error), sent && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 rounded-xl p-3 mb-3 text-xs", style: { background: "#E4F5EC", color: GREEN } }, /* @__PURE__ */ import_react.default.createElement(CircleCheck, { size: 14 }), " Signalement envoy\xE9 \u2014 merci pour votre retour."), /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: handleSubmit, className: "space-y-3 max-w-md" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      placeholder: "Sujet (ex. : erreur \xE0 l'import de fichier Excel)",
      value: sujet,
      onChange: (e) => setSujet(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    "textarea",
    {
      placeholder: "Description d\xE9taill\xE9e\u2026",
      rows: 4,
      value: message,
      onChange: (e) => setMessage(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 resize-none focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "submit",
      disabled: sending,
      className: "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-white shadow-md",
      style: { background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }
    },
    sending && /* @__PURE__ */ import_react.default.createElement(LoaderCircle, { size: 15, className: "animate-spin" }),
    " ",
    /* @__PURE__ */ import_react.default.createElement(Mail, { size: 14 }),
    " Envoyer le signalement"
  ))), /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-sm font-semibold mb-2", style: { color: NAVY } }, "Ou par e-mail direct"), /* @__PURE__ */ import_react.default.createElement(
    "a",
    {
      href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("AgriHakStat \u2014 Signalement")}${userEmail ? `&body=${encodeURIComponent("Compte concern\xE9 : " + userEmail + "\n\nDescription du probl\xE8me :\n")}` : ""}`,
      className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-md",
      style: { background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }
    },
    /* @__PURE__ */ import_react.default.createElement(Mail, { size: 15 }),
    " ",
    CONTACT_EMAIL
  )));
}
function AdminSettingsTab({ currentUserId }) {
  const [users, setUsers] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)("");
  const [busyId, setBusyId] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    supabase.from("profiles").select("id, email, role, created_at").order("created_at", { ascending: false }).then(({ data, error: error2 }) => {
      if (error2) setError(error2.message);
      setUsers(data || []);
      setLoading(false);
    });
  }, []);
  const toggleRole = async (u) => {
    setBusyId(u.id);
    const newRole = u.role === "admin" ? "user" : "admin";
    const { error: error2 } = await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    setBusyId(null);
    if (error2) {
      setError(error2.message);
      return;
    }
    setUsers(users.map((x) => x.id === u.id ? { ...x, role: newRole } : x));
  };
  return /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ import_react.default.createElement(Users, { size: 16, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Administration \u2014 gestion des r\xF4les")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-4" }, "R\xE9serv\xE9 aux administrateurs. Promouvez ou r\xE9trogradez un utilisateur sans passer par le code ou Supabase directement."), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 mb-3 text-xs", style: { background: "#FBE7E5", color: "#B3413A" } }, error), loading ? /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400" }, "Chargement\u2026") : /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2" }, users.map((u) => /* @__PURE__ */ import_react.default.createElement("div", { key: u.id, className: "flex items-center justify-between rounded-xl border border-gray-100 p-3" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm text-gray-800" }, u.email, u.id === currentUserId && /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[10px] text-gray-400 ml-1.5" }, "(vous)")), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-400" }, "Inscrit le ", new Date(u.created_at).toLocaleDateString("fr-FR"))), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => toggleRole(u),
      disabled: busyId === u.id || u.id === currentUserId,
      className: "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-40",
      style: u.role === "admin" ? { background: "#EBEEF7", color: NAVY } : { background: "#F1F1EC", color: "#6B7280" }
    },
    u.role === "admin" ? /* @__PURE__ */ import_react.default.createElement(ToggleRight, { size: 14 }) : /* @__PURE__ */ import_react.default.createElement(ToggleLeft, { size: 14 }),
    u.role === "admin" ? "Administrateur" : "Utilisateur"
  )))));
}
function AppSettingsEditor() {
  const [settings, setSettings] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)("");
  const [savingKey, setSavingKey] = (0, import_react.useState)(null);
  const [savedKey, setSavedKey] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    supabase.from("app_settings").select("key, value, updated_at").order("key").then(({ data, error: error2 }) => {
      if (error2) setError(error2.message);
      setSettings((data || []).map((s) => ({ ...s, draft: typeof s.value === "string" ? s.value : JSON.stringify(s.value) })));
      setLoading(false);
    });
  }, []);
  const updateDraft = (key, val) => setSettings(settings.map((s) => s.key === key ? { ...s, draft: val } : s));
  const saveSetting = async (s) => {
    setSavingKey(s.key);
    setSavedKey(null);
    let value = s.draft;
    if (typeof s.value === "number" && !isNaN(Number(s.draft))) value = Number(s.draft);
    const { error: error2 } = await supabase.from("app_settings").update({ value, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("key", s.key);
    setSavingKey(null);
    if (error2) {
      setError(error2.message);
      return;
    }
    setSavedKey(s.key);
    setTimeout(() => setSavedKey(null), 2e3);
  };
  const LABELS = {
    message_accueil: "Message d'accueil affich\xE9 aux utilisateurs",
    seuil_alerte_realisation: "Seuil d'alerte \u2014 taux de r\xE9alisation (%)",
    seuil_capacite_atypique: "Seuil de signalement \u2014 capacit\xE9 atypique (tonnes)",
    contact_support: "Adresse e-mail de support affich\xE9e"
  };
  return /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ import_react.default.createElement(ToggleRight, { size: 16, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "R\xE9glages g\xE9n\xE9raux de l'application")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-4" }, "Ces valeurs pilotent le comportement de l'application pour tous les utilisateurs \u2014 modifiables ici, sans jamais toucher au code."), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 mb-3 text-xs", style: { background: "#FBE7E5", color: "#B3413A" } }, error), loading ? /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400" }, "Chargement\u2026") : settings.length === 0 ? /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 italic" }, "Aucun r\xE9glage trouv\xE9 \u2014 v\xE9rifiez que la table app_settings a bien \xE9t\xE9 cr\xE9\xE9e (section 8 de supabase_setup.sql).") : /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-3" }, settings.map((s) => /* @__PURE__ */ import_react.default.createElement("div", { key: s.key, className: "flex items-center gap-3 rounded-xl border border-gray-100 p-3" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-medium text-gray-700" }, LABELS[s.key] || s.key), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[10px] text-gray-400 font-mono" }, s.key)), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      value: s.draft,
      onChange: (e) => updateDraft(s.key, e.target.value),
      className: "text-sm rounded-lg border border-gray-200 p-2 w-48 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => saveSetting(s),
      disabled: savingKey === s.key,
      className: "text-xs font-medium px-3 py-2 rounded-lg text-white shrink-0",
      style: { background: savedKey === s.key ? "#3E9C6B" : NAVY }
    },
    savingKey === s.key ? "\u2026" : savedKey === s.key ? /* @__PURE__ */ import_react.default.createElement(CircleCheck, { size: 13 }) : "Enregistrer"
  )))));
}
function BugReportsList() {
  const [reports, setReports] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => {
    supabase.from("bug_reports").select("*").order("created_at", { ascending: false }).then(({ data, error: error2 }) => {
      if (error2) setError(error2.message);
      setReports(data || []);
      setLoading(false);
    });
  }, []);
  const markResolved = async (r) => {
    const { error: error2 } = await supabase.from("bug_reports").update({ statut: "r\xE9solu" }).eq("id", r.id);
    if (!error2) setReports(reports.map((x) => x.id === r.id ? { ...x, statut: "r\xE9solu" } : x));
  };
  return /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ import_react.default.createElement(Mail, { size: 16, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Signalements re\xE7us")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-4" }, "Messages envoy\xE9s par les utilisateurs depuis l'onglet Contact."), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 mb-3 text-xs", style: { background: "#FBE7E5", color: "#B3413A" } }, error), loading ? /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400" }, "Chargement\u2026") : reports.length === 0 ? /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 italic" }, "Aucun signalement pour l'instant.") : /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-2 max-h-80 overflow-y-auto" }, reports.map((r) => /* @__PURE__ */ import_react.default.createElement("div", { key: r.id, className: "rounded-xl border border-gray-100 p-3" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-semibold text-gray-800" }, r.sujet), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-500 mt-0.5" }, r.message), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[10px] text-gray-400 mt-1" }, r.user_email, " \xB7 ", new Date(r.created_at).toLocaleDateString("fr-FR"))), r.statut === "r\xE9solu" ? /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[10px] font-medium px-2 py-1 rounded-full shrink-0", style: { background: "#E4F5EC", color: GREEN } }, "R\xE9solu") : /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => markResolved(r), className: "text-[10px] font-medium px-2 py-1 rounded-full shrink-0", style: { background: "#FDF1DA", color: "#8A5A00" } }, "Marquer r\xE9solu"))))));
}
export {
  Settings as default
};
