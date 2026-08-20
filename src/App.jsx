import React, { useState, useEffect } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import Dashboard from "./Dashboard.jsx";
import ImportWizard from "./ImportWizard.jsx";
import AnalysisConfig from "./AnalysisConfig.jsx";
import ResultsReport from "./ResultsReport.jsx";
import Cartographie from "./Cartographie.jsx";
import Landing from "./auth/Landing.jsx";
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const SCREENS = {
  dashboard: Dashboard, import: ImportWizard, config: AnalysisConfig,
  results: ResultsReport, map: Cartographie,
};

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
  const [context, setContext] = useState(persisted?.context || null); // contexte de l'étude (objectif, communes, filières, période, indicateurs)

  // Sauvegarde automatique du travail en cours (survit à une fermeture d'onglet ou un rechargement)
  useEffect(() => {
    savePersisted({ active, dataset, analysisQueue, context, guestMode });
  }, [active, dataset, analysisQueue, context, guestMode]);

  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
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
    setContext(null);
    setAuthView("landing");
  };

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
          context={context}
          onContextChange={setContext}
        />
      )}
    </div>
  );
}
