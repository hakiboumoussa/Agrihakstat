import React, { useState, useEffect, Suspense, lazy } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
// Écrans chargés à la demande (découpage du bundle par route) : le bundle unique (5,7 Mo avant
// cette optimisation) embarquait la totalité des dépendances propres à chaque écran — Leaflet pour
// la seule Cartographie, xlsx/PapaParse pour le seul Assistant d'import, docx/recharts pour le seul
// module Résultats — dans le paquet initial chargé par tout le monde, y compris un visiteur qui ne
// consulte que le tableau de bord. React.lazy + import() dynamique laisse esbuild découper ces
// dépendances en fragments séparés (cf. package.json, build:js), chargés uniquement à la navigation
// vers l'écran correspondant.
const Dashboard = lazy(() => import("./Dashboard.jsx"));
const ImportWizard = lazy(() => import("./ImportWizard.jsx"));
const AnalysisConfig = lazy(() => import("./AnalysisConfig.jsx"));
const ResultsReport = lazy(() => import("./ResultsReport.jsx"));
const Cartographie = lazy(() => import("./Cartographie.jsx"));
const Climate = lazy(() => import("./Climate.jsx"));
const Settings = lazy(() => import("./Settings.jsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.jsx"));
import Landing from "./auth/Landing.jsx";
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { loadWorkSession, saveWorkSession } from "./persistence.js";

const SCREENS = {
  dashboard: Dashboard, import: ImportWizard, config: AnalysisConfig,
  results: ResultsReport, map: Cartographie, climate: Climate, settings: Settings,
};

function ScreenLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <div className="w-4 h-4 rounded-full border-2 border-[#1F3864]/20 border-t-[#1F3864] animate-spin" />
        Chargement du module…
      </div>
    </div>
  );
}

const STORAGE_KEY = "agrihakstat_session_v1";

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePersisted(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Impossible d'enregistrer la session localement (quota dépassé ?)", e.message);
  }
}

export default function App() {
  const persisted = loadPersisted();
  const [authView, setAuthView] = useState("landing"); // landing | login | signup
  const [session, setSession] = useState(undefined); // undefined = chargement, null = déconnecté
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState(persisted?.active || "dashboard");
  const [showAdmin, setShowAdmin] = useState(false);
  const [guestMode, setGuestMode] = useState(persisted?.guestMode || false);
  const [dataset, setDataset] = useState(persisted?.dataset || null); // { rows, columns, fileName } — données réellement importées
  const [analysisQueue, setAnalysisQueue] = useState(persisted?.analysisQueue || []); // analyses réellement configurées et calculées
  const [univariateQueue, setUnivariateQueue] = useState(persisted?.univariateQueue || []); // variables univariées validées pour le rapport
  const [context, setContext] = useState(persisted?.context || null); // contexte de l'étude (objectif, communes, filières, période, indicateurs)
  const [recoveryMode, setRecoveryMode] = useState(false);
  // true une fois la tentative de reprise depuis Supabase terminée (réussie, échouée, ou non
  // applicable — invité/hors ligne) : évite d'enregistrer un état encore incomplet par-dessus une
  // session distante avant même d'avoir tenté de la charger.
  const [remoteSessionReady, setRemoteSessionReady] = useState(false);

  // Sauvegarde automatique du travail en cours (survit à une fermeture d'onglet ou un rechargement)
  useEffect(() => {
    savePersisted({ active, dataset, analysisQueue, univariateQueue, context, guestMode });
  }, [active, dataset, analysisQueue, univariateQueue, context, guestMode]);

  // Reprise du travail depuis Supabase (public.work_sessions, cf. persistence.js) à la connexion :
  // permet de retrouver la base importée, la file d'analyses et le rapport depuis un autre appareil,
  // ou après suppression du localStorage — le localStorage reste le filet de sécurité immédiat,
  // cette couche est la persistance durable multi-appareil. N'écrase l'état local que sur les champs
  // où Supabase a effectivement quelque chose (un dataset non vide, une file non vide...), pour ne
  // pas effacer un travail en cours dans cet onglet par une session distante encore vide.
  useEffect(() => {
    if (!session || !isSupabaseConfigured || guestMode) { setRemoteSessionReady(true); return; }
    let cancelled = false;
    loadWorkSession(session.user.id).then((remote) => {
      if (cancelled) return;
      if (remote) {
        if (remote.dataset) setDataset(remote.dataset);
        if (Array.isArray(remote.analysis_queue) && remote.analysis_queue.length > 0) setAnalysisQueue(remote.analysis_queue);
        if (Array.isArray(remote.univariate_queue) && remote.univariate_queue.length > 0) setUnivariateQueue(remote.univariate_queue);
        if (remote.context) setContext(remote.context);
      }
      setRemoteSessionReady(true);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, guestMode]);

  // Sauvegarde différée (anti-rebond) vers Supabase, une fois la reprise initiale terminée — pour ne
  // pas déclencher un upsert à chaque frappe/changement d'état, ni écraser la session distante avant
  // d'avoir eu la chance de la charger (cf. effet précédent).
  useEffect(() => {
    if (!session || !isSupabaseConfigured || guestMode || !remoteSessionReady) return;
    const timer = setTimeout(() => {
      saveWorkSession(session.user.id, { dataset, analysisQueue, univariateQueue, context });
    }, 1500);
    return () => clearTimeout(timer);
  }, [session, guestMode, remoteSessionReady, dataset, analysisQueue, univariateQueue, context]);

  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (_event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !isSupabaseConfigured) { setProfile(null); return; }
    supabase.from("profiles").select("role, email").eq("id", session.user.id).single()
      .then(({ data, error }) => {
        if (error) console.error("Erreur de récupération du profil (rôle) :", error.message, error);
        setProfile(data);
      });
  }, [session]);

  const handleNavigate = (id) => {
    setActive(id);
    setShowAdmin(false);
    if (isSupabaseConfigured && session) {
      supabase.from("activity_log").insert({ user_id: session.user.id, screen: id }).then(() => {});
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setDataset(null);
    setAnalysisQueue([]);
    setUnivariateQueue([]);
    setContext(null);
    setAuthView("landing");
  };

  // --- Réinitialisation de mot de passe : prioritaire sur tout le reste ---
  if (recoveryMode) {
    return <ResetPassword onDone={() => setRecoveryMode(false)} />;
  }

  // --- Non connecté : accueil / connexion / inscription / démonstration libre ---
  if (!session && !guestMode) {
    if (authView === "login") {
      return <Login onGoSignup={() => setAuthView("signup")} onGoLanding={() => setAuthView("landing")} />;
    }
    if (authView === "signup") {
      return <Signup onGoLogin={() => setAuthView("login")} onGoLanding={() => setAuthView("landing")} />;
    }
    return <Landing onGoLogin={() => setAuthView("login")} onGoSignup={() => setAuthView("signup")} onGoDemo={() => setGuestMode(true)} />;
  }

  // --- Connecté (ou démonstration libre) : application ---
  const Active = SCREENS[active];
  const isAdmin = profile?.role === "admin";
  const isGuest = guestMode && !session;
  const userEmail = session?.user?.email || "";
  const roleLabel = isGuest ? "Démonstration" : isAdmin ? "Administrateur" : "Utilisateur";
  const handleTopRightLogout = isGuest ? () => setGuestMode(false) : handleLogout;

  return (
    <div className="relative">
      {isGuest && (
        <div className="sticky top-0 z-[70] bg-[#C99A2E] text-[#1F3864] text-xs font-medium text-center py-1.5">
          Mode démonstration — aucune donnée n'est enregistrée.{" "}
          <button onClick={() => { setGuestMode(false); setAuthView("signup"); }} className="underline font-semibold">
            Créer un compte
          </button>
        </div>
      )}

      <Suspense fallback={<ScreenLoading />}>
        {showAdmin ? (
          <AdminDashboard onBack={() => setShowAdmin(false)} />
        ) : (
          <Active
            active={active}
            onNavigate={handleNavigate}
            userEmail={userEmail}
            userId={session?.user?.id}
            roleLabel={roleLabel}
            isAdmin={isAdmin}
            isGuest={isGuest}
            onLogout={handleTopRightLogout}
            onOpenAdmin={() => setShowAdmin(true)}
            dataset={dataset}
            onDatasetParsed={setDataset}
            analysisQueue={analysisQueue}
            onAnalysisQueueChange={setAnalysisQueue}
            univariateQueue={univariateQueue}
            onUnivariateQueueChange={setUnivariateQueue}
            context={context}
            onContextChange={setContext}
          />
        )}
      </Suspense>
    </div>
  );
}
