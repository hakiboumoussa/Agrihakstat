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

  // Sauvegarde automatique du travail en cours (survit à une fermeture d'onglet ou un rechargement)
  useEffect(() => {
    savePersisted({ active, dataset, analysisQueue, univariateQueue, context, guestMode });
  }, [active, dataset, analysisQueue, univariateQueue, context, guestMode]);

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
