import React, { useState, useEffect } from "react";
import {
  Bell, User, ShieldCheck, FileText, HelpCircle, Mail, Loader2, AlertCircle,
  CheckCircle2, KeyRound, Users, ToggleLeft, ToggleRight, Trash2,
} from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import UserMenu from "./UserMenu.jsx";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";

const CONTACT_EMAIL = "hakiboumoussa@gmail.com";

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}`}>{children}</div>;
}

const TABS = [
  { id: "compte", label: "Mon compte", icon: User },
  { id: "confidentialite", label: "Confidentialité", icon: ShieldCheck },
  { id: "conditions", label: "Conditions d'utilisation", icon: FileText },
  { id: "guide", label: "Guide d'utilisation", icon: HelpCircle },
  { id: "contact", label: "Contact & bugs", icon: Mail },
];

export default function Settings({ active, onNavigate, userEmail, userId, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const [tab, setTab] = useState("compte");

  const tabs = isAdmin ? [...TABS, { id: "admin", label: "Administration", icon: Users }] : TABS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <div className="flex">
        <Sidebar active={active} onNavigate={onNavigate} />

        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Paramètres</h1>
              <p className="text-xs text-gray-500 mt-0.5">Compte, confidentialité et assistance</p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8 grid grid-cols-4 gap-6">
            <div className="space-y-1.5">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
                  style={tab === t.id ? { background: NAVY, color: "white" } : { color: "#5A6478" }}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            <div className="col-span-3">
              {tab === "compte" && <AccountTab userEmail={userEmail} roleLabel={roleLabel} isGuest={isGuest} />}
              {tab === "confidentialite" && <PrivacyTab />}
              {tab === "conditions" && <TermsTab />}
              {tab === "guide" && <GuideTab />}
              {tab === "contact" && <ContactTab userEmail={userEmail} userId={userId} isGuest={isGuest} />}
              {tab === "admin" && isAdmin && (
                <div className="space-y-4">
                  <AdminSettingsTab currentUserId={userId} />
                  <AppSettingsEditor />
                  <BugReportsList />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ userEmail, roleLabel, isGuest }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(""); setDone(false);
    if (isGuest) { setError("Créez un compte pour gérer un mot de passe."); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else { setDone(true); setPassword(""); setConfirm(""); }
  };

  return (
    <Card>
      <h2 className="font-serif font-semibold mb-4" style={{ color: NAVY }}>Mon compte</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-3" style={{ background: "#EBEEF7" }}>
          <div className="text-[10px] text-gray-500">Adresse e-mail</div>
          <div className="text-sm font-medium" style={{ color: NAVY }}>{isGuest ? "Mode démonstration" : userEmail}</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: "#EBEEF7" }}>
          <div className="text-[10px] text-gray-500">Rôle</div>
          <div className="text-sm font-medium" style={{ color: NAVY }}>{roleLabel}</div>
        </div>
      </div>

      <h3 className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Changer de mot de passe</h3>
      {error && (
        <div className="flex items-start gap-2 rounded-xl p-3 mb-3 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {done && (
        <div className="flex items-center gap-2 rounded-xl p-3 mb-3 text-xs" style={{ background: "#E4F5EC", color: GREEN }}>
          <CheckCircle2 size={14} /> Mot de passe mis à jour avec succès.
        </div>
      )}
      <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
        <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
        <input type="password" placeholder="Confirmer le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
        <button type="submit" disabled={loading}
          className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
          {loading && <Loader2 size={15} className="animate-spin" />} <KeyRound size={14} /> Mettre à jour
        </button>
      </form>
    </Card>
  );
}

function PrivacyTab() {
  return (
    <Card>
      <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Politique de confidentialité</h2>
      <div className="text-xs text-gray-600 leading-relaxed space-y-3">
        <p><strong>Données collectées.</strong> AgriHakStat collecte votre adresse e-mail (création de compte), les fichiers de questionnaire et de base de données que vous importez volontairement, le contexte de vos études (objectifs, indicateurs, zones géographiques), ainsi que des données d'usage anonymisées (écrans consultés) à des fins d'amélioration du service.</p>
        <p><strong>Hébergement et sous-traitance.</strong> Les comptes et données sont hébergés par Supabase (base de données PostgreSQL et authentification) et le site est servi par Vercel. Aucune donnée n'est vendue ni partagée avec des tiers à des fins commerciales.</p>
        <p><strong>Vos droits.</strong> Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données en écrivant à l'adresse indiquée dans l'onglet Contact. Vous pouvez également supprimer vos bases de données importées directement depuis l'assistant d'import.</p>
        <p><strong>Sécurité.</strong> L'accès à vos propres données est protégé par une politique de sécurité au niveau des lignes (Row Level Security) : seul vous-même, et l'administrateur de votre structure pour les besoins de suivi institutionnel, pouvez consulter vos projets soumis.</p>
        <p className="text-gray-400 italic">Ce document est une version de travail, destinée à être révisée avec un conseil juridique avant toute mise en production à grande échelle.</p>
      </div>
    </Card>
  );
}

function TermsTab() {
  return (
    <Card>
      <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Conditions d'utilisation</h2>
      <div className="text-xs text-gray-600 leading-relaxed space-y-3">
        <p><strong>Objet.</strong> AgriHakStat est un outil d'aide à l'analyse statistique d'enquêtes agricoles. Les tests statistiques proposés automatiquement sont des recommandations méthodologiques ; leur validation reste sous la responsabilité de l'analyste.</p>
        <p><strong>Propriété des données.</strong> Les données que vous importez vous appartiennent. AgriHakStat ne revendique aucun droit de propriété sur vos bases de données, vos résultats ou vos rapports.</p>
        <p><strong>Usage acceptable.</strong> Vous vous engagez à ne pas importer de données à caractère personnel sensible sans base légale appropriée, et à utiliser les résultats générés avec le discernement scientifique requis avant toute décision opérationnelle.</p>
        <p><strong>Limitation de responsabilité.</strong> Les analyses, y compris celles rédigées avec l'assistance d'une intelligence artificielle, sont fournies à titre d'aide à la décision et ne sauraient se substituer au jugement professionnel de l'analyste.</p>
        <p className="text-gray-400 italic">Version de travail — à faire réviser juridiquement avant diffusion publique.</p>
      </div>
    </Card>
  );
}

function GuideTab() {
  const steps = [
    ["Assistant d'import", "Importez votre questionnaire et votre base de données (.xlsx ou .csv), définissez le contexte de l'étude et vos indicateurs de performance."],
    ["Configuration des analyses", "Sélectionnez des variables ou laissez Claude proposer des croisements pertinents ; validez le test statistique et ses conditions d'application."],
    ["Résultats & rapport", "Consultez les résultats réellement calculés, validez ceux à inclure, faites rédiger l'analyse par Claude, puis exportez en Word."],
    ["Cartographie", "Visualisez la localisation réelle de vos données si des colonnes de géolocalisation sont détectées."],
  ];
  return (
    <Card>
      <h2 className="font-serif font-semibold mb-4" style={{ color: NAVY }}>Guide d'utilisation rapide</h2>
      <div className="space-y-4">
        {steps.map(([title, text], i) => (
          <div key={title} className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: GOLD }}>{i + 1}</div>
            <div>
              <div className="text-sm font-semibold" style={{ color: NAVY }}>{title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{text}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ContactTab({ userEmail, userId, isGuest }) {
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSent(false);
    if (isGuest) { setError("Créez un compte pour envoyer un signalement suivi ; vous pouvez sinon écrire directement par e-mail ci-dessous."); return; }
    if (!sujet.trim() || !message.trim()) { setError("Merci de renseigner un sujet et un message."); return; }
    setSending(true);
    const { error } = await supabase.from("bug_reports").insert({ user_id: userId, user_email: userEmail, sujet, message });
    setSending(false);
    if (error) setError(error.message);
    else { setSent(true); setSujet(""); setMessage(""); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Signaler un problème</h2>
        <p className="text-xs text-gray-500 mb-4">
          Décrivez l'écran concerné et les étapes pour reproduire le problème. Votre signalement est transmis directement à l'administrateur.
        </p>
        {error && (
          <div className="flex items-start gap-2 rounded-xl p-3 mb-3 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {sent && (
          <div className="flex items-center gap-2 rounded-xl p-3 mb-3 text-xs" style={{ background: "#E4F5EC", color: GREEN }}>
            <CheckCircle2 size={14} /> Signalement envoyé — merci pour votre retour.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
          <input placeholder="Sujet (ex. : erreur à l'import de fichier Excel)" value={sujet} onChange={(e) => setSujet(e.target.value)}
            className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
          <textarea placeholder="Description détaillée…" rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full text-sm rounded-xl border border-gray-200 p-2.5 resize-none focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
          <button type="submit" disabled={sending}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
            {sending && <Loader2 size={15} className="animate-spin" />} <Mail size={14} /> Envoyer le signalement
          </button>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Ou par e-mail direct</h3>
        <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("AgriHakStat — Signalement")}${userEmail ? `&body=${encodeURIComponent("Compte concerné : " + userEmail + "\n\nDescription du problème :\n")}` : ""}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
          <Mail size={15} /> {CONTACT_EMAIL}
        </a>
      </Card>
    </div>
  );
}

function AdminSettingsTab({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    supabase.from("profiles").select("id, email, role, created_at").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setUsers(data || []);
        setLoading(false);
      });
  }, []);

  const toggleRole = async (u) => {
    setBusyId(u.id);
    const newRole = u.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    setBusyId(null);
    if (error) { setError(error.message); return; }
    setUsers(users.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Users size={16} style={{ color: GOLD }} />
        <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Administration — gestion des rôles</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Réservé aux administrateurs. Promouvez ou rétrogradez un utilisateur sans passer par le code ou Supabase directement.
      </p>
      {error && (
        <div className="rounded-xl p-3 mb-3 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>{error}</div>
      )}
      {loading ? (
        <p className="text-xs text-gray-400">Chargement…</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
              <div>
                <div className="text-sm text-gray-800">{u.email}{u.id === currentUserId && <span className="text-[10px] text-gray-400 ml-1.5">(vous)</span>}</div>
                <div className="text-[11px] text-gray-400">Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}</div>
              </div>
              <button onClick={() => toggleRole(u)} disabled={busyId === u.id || u.id === currentUserId}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-40"
                style={u.role === "admin" ? { background: "#EBEEF7", color: NAVY } : { background: "#F1F1EC", color: "#6B7280" }}>
                {u.role === "admin" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {u.role === "admin" ? "Administrateur" : "Utilisateur"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Réglages généraux de l'application — modifiables par l'administrateur sans passer par le code
function AppSettingsEditor() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  useEffect(() => {
    supabase.from("app_settings").select("key, value, updated_at").order("key")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setSettings((data || []).map((s) => ({ ...s, draft: typeof s.value === "string" ? s.value : JSON.stringify(s.value) })));
        setLoading(false);
      });
  }, []);

  const updateDraft = (key, val) =>
    setSettings(settings.map((s) => (s.key === key ? { ...s, draft: val } : s)));

  const saveSetting = async (s) => {
    setSavingKey(s.key);
    setSavedKey(null);
    let value = s.draft;
    // Conserve un nombre si la valeur d'origine était numérique
    if (typeof s.value === "number" && !isNaN(Number(s.draft))) value = Number(s.draft);
    const { error } = await supabase.from("app_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", s.key);
    setSavingKey(null);
    if (error) { setError(error.message); return; }
    setSavedKey(s.key);
    setTimeout(() => setSavedKey(null), 2000);
  };

  const LABELS = {
    message_accueil: "Message d'accueil affiché aux utilisateurs",
    seuil_alerte_realisation: "Seuil d'alerte — taux de réalisation (%)",
    seuil_capacite_atypique: "Seuil de signalement — capacité atypique (tonnes)",
    contact_support: "Adresse e-mail de support affichée",
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <ToggleRight size={16} style={{ color: GOLD }} />
        <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Réglages généraux de l'application</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Ces valeurs pilotent le comportement de l'application pour tous les utilisateurs — modifiables ici, sans jamais toucher au code.
      </p>
      {error && <div className="rounded-xl p-3 mb-3 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>{error}</div>}
      {loading ? (
        <p className="text-xs text-gray-400">Chargement…</p>
      ) : settings.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Aucun réglage trouvé — vérifiez que la table app_settings a bien été créée (section 8 de supabase_setup.sql).</p>
      ) : (
        <div className="space-y-3">
          {settings.map((s) => (
            <div key={s.key} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-700">{LABELS[s.key] || s.key}</div>
                <div className="text-[10px] text-gray-400 font-mono">{s.key}</div>
              </div>
              <input value={s.draft} onChange={(e) => updateDraft(s.key, e.target.value)}
                className="text-sm rounded-lg border border-gray-200 p-2 w-48 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
              <button onClick={() => saveSetting(s)} disabled={savingKey === s.key}
                className="text-xs font-medium px-3 py-2 rounded-lg text-white shrink-0" style={{ background: savedKey === s.key ? "#3E9C6B" : NAVY }}>
                {savingKey === s.key ? "…" : savedKey === s.key ? <CheckCircle2 size={13} /> : "Enregistrer"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Liste des signalements de bug / contacts reçus des utilisateurs, réservée à l'administrateur
function BugReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("bug_reports").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setReports(data || []);
        setLoading(false);
      });
  }, []);

  const markResolved = async (r) => {
    const { error } = await supabase.from("bug_reports").update({ statut: "résolu" }).eq("id", r.id);
    if (!error) setReports(reports.map((x) => (x.id === r.id ? { ...x, statut: "résolu" } : x)));
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Mail size={16} style={{ color: GOLD }} />
        <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Signalements reçus</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">Messages envoyés par les utilisateurs depuis l'onglet Contact.</p>
      {error && <div className="rounded-xl p-3 mb-3 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>{error}</div>}
      {loading ? (
        <p className="text-xs text-gray-400">Chargement…</p>
      ) : reports.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Aucun signalement pour l'instant.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-gray-800">{r.sujet}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{r.message}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{r.user_email} · {new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
                {r.statut === "résolu" ? (
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full shrink-0" style={{ background: "#E4F5EC", color: GREEN }}>Résolu</span>
                ) : (
                  <button onClick={() => markResolved(r)} className="text-[10px] font-medium px-2 py-1 rounded-full shrink-0" style={{ background: "#FDF1DA", color: "#8A5A00" }}>
                    Marquer résolu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
