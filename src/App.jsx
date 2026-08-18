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

export default function App() {
  const [authView, setAuthView] = useState("landing"); // landing | login | signup
  const [session, setSession] = useState(undefined); // undefined = chargement, null = déconnecté
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [showAdmin, setShowAdmin] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !isSupabaseConfigured) { setProfile(null); return; }
    supabase.from("profiles").select("role, email").eq("id", session.user.id).single()
      .then(({ data }) => setProfile(data));
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

  return (
    <div className="relative">
      {guestMode && !session && (
        <div className="fixed top-0 left-0 right-0 z-[70] bg-[#C99A2E] text-[#1F3864] text-xs font-medium text-center py-1.5">
          Mode démonstration — aucune donnée n'est enregistrée.{" "}
          <button onClick={() => { setGuestMode(false); setAuthView("signup"); }} className="underline font-semibold">
            Créer un compte
          </button>
        </div>
      )}
      <div className={`fixed ${guestMode && !session ? "top-9" : "top-3"} right-4 z-[60] flex items-center gap-2`}>
        {isAdmin && (
          <button onClick={() => setShowAdmin(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1F3864] text-white shadow-md">
            <ShieldCheck size={13} /> Admin
          </button>
        )}
        <button onClick={guestMode && !session ? () => setGuestMode(false) : handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white shadow-md border border-gray-200 text-gray-600">
          <LogOut size={13} /> {guestMode && !session ? "Quitter la démo" : "Déconnexion"}
        </button>
      </div>

      {showAdmin ? (
        <AdminDashboard onBack={() => setShowAdmin(false)} />
      ) : (
        <Active active={active} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
