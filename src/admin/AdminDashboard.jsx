import React, { useEffect, useState } from "react";
import {
  ArrowLeft, Users, Activity, Clock, FolderKanban, ChevronRight, Layers, MapPin, User, Calendar,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "../supabaseClient.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";
const GREEN_TINT = "#E4F5EC";
const AMBER_TINT = "#FDF1DA";

const SCREEN_LABELS = {
  dashboard: "Tableau de bord", import: "Assistant d'import", config: "Configuration des analyses",
  results: "Résultats & rapport", map: "Cartographie",
};

const THEME_COLORS = ["#1F3864", "#3E9C6B", "#C99A2E", "#3592C4", "#B5651D", "#6C7DAE", "#B3413A"];
function themeColor(i) { return THEME_COLORS[i % THEME_COLORS.length]; }

export default function AdminDashboard({ onBack }) {
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: profiles, error: e1 } = await supabase
        .from("profiles").select("email, role, created_at").order("created_at", { ascending: false });
      const { data: logs, error: e2 } = await supabase
        .from("activity_log").select("screen");
      const { data: projs, error: e3 } = await supabase
        .from("projets").select("id, titre, thematiques, communes, statut, user_email, created_at")
        .order("created_at", { ascending: false });
      if (e1 || e2 || e3) setError((e1 || e2 || e3).message);
      setUsers(profiles || []);
      setActivity(logs || []);
      setProjets(projs || []);
      setLoading(false);
    }
    load();
  }, []);

  // Fréquentation par écran (déjà existant)
  const counts = {};
  activity.forEach((a) => { counts[a.screen] = (counts[a.screen] || 0) + 1; });
  const chartData = Object.entries(SCREEN_LABELS).map(([id, label]) => ({ label, visites: counts[id] || 0 }));

  // Regroupement des projets soumis par thématique (un projet peut couvrir plusieurs thématiques)
  const themeMap = {};
  projets.forEach((p) => {
    (p.thematiques && p.thematiques.length ? p.thematiques : ["Non renseigné"]).forEach((t) => {
      if (!themeMap[t]) themeMap[t] = [];
      themeMap[t].push(p);
    });
  });
  const themes = Object.entries(themeMap).sort((a, b) => b[1].length - a[1].length);

  const themeProjects = selectedTheme ? (themeMap[selectedTheme] || []) : [];
  const themeUsers = new Set(themeProjects.map((p) => p.user_email)).size;
  const themeLastDate = themeProjects[0]?.created_at;

  return (
    <div className="min-h-screen bg-[#F4F6FB] font-sans p-8">
      <button onClick={selectedTheme ? () => setSelectedTheme(null) : onBack} className="flex items-center gap-2 text-sm mb-6" style={{ color: NAVY }}>
        <ArrowLeft size={15} /> {selectedTheme ? "Retour aux thématiques" : "Retour à l'application"}
      </button>

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: "#FBE7E5", color: "#B3413A" }}>
          {error}. Vérifiez que le script supabase_setup.sql a bien été exécuté (y compris la table « projets ») et que votre compte a le rôle « admin ».
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : selectedTheme ? (
        /* ---------- VUE DÉTAIL D'UNE THÉMATIQUE ---------- */
        <>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ background: themeColor(themes.findIndex(([t]) => t === selectedTheme)) }} />
            <h1 className="font-serif text-2xl font-bold" style={{ color: NAVY }}>Thématique : {selectedTheme}</h1>
          </div>
          <p className="text-sm text-gray-500 mb-6">Point des projets soumis par les utilisateurs sur cette thématique</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <FolderKanban size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{themeProjects.length}</div>
              <div className="text-xs text-gray-400">Projets soumis</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <Users size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{themeUsers}</div>
              <div className="text-xs text-gray-400">Utilisateurs distincts</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <Clock size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>
                {themeLastDate ? new Date(themeLastDate).toLocaleDateString("fr-FR") : "—"}
              </div>
              <div className="text-xs text-gray-400">Dernier dépôt</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="px-5 py-4">
              <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Projets soumis sur cette thématique</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 uppercase border-t border-b border-gray-100">
                  <th className="px-5 py-2 font-medium">Objectif / Titre</th>
                  <th className="px-5 py-2 font-medium">Soumis par</th>
                  <th className="px-5 py-2 font-medium">Communes</th>
                  <th className="px-5 py-2 font-medium">Statut</th>
                  <th className="px-5 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {themeProjects.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 text-gray-800 max-w-xs">{p.titre}</td>
                    <td className="px-5 py-3 text-gray-500">{p.user_email}</td>
                    <td className="px-5 py-3 text-gray-500">{(p.communes || []).join(", ") || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 rounded-full text-[11px] font-medium" style={{ background: GREEN_TINT, color: GREEN }}>
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
                {themeProjects.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-xs">Aucun projet sur cette thématique.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ---------- VUE D'ENSEMBLE ---------- */
        <>
          <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: NAVY }}>Panneau d'administration</h1>
          <p className="text-sm text-gray-500 mb-6">Utilisateurs inscrits, fréquentation, et projets soumis par thématique</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <Users size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{users.length}</div>
              <div className="text-xs text-gray-400">Utilisateurs inscrits</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <FolderKanban size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{projets.length}</div>
              <div className="text-xs text-gray-400">Projets soumis au total</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <Clock size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>
                {users[0] ? new Date(users[0].created_at).toLocaleDateString("fr-FR") : "—"}
              </div>
              <div className="text-xs text-gray-400">Dernière inscription</div>
            </div>
          </div>

          {/* NOUVEAU : point des projets soumis, par thématique — cliquer pour le détail */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={16} style={{ color: NAVY }} />
              <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Projets soumis par thématique</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">Cliquez sur une thématique pour ouvrir son tableau de bord de suivi.</p>

            {themes.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun projet soumis pour l'instant.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {themes.map(([theme, list], i) => {
                  const distinctUsers = new Set(list.map((p) => p.user_email)).size;
                  return (
                    <button key={theme} onClick={() => setSelectedTheme(theme)}
                      className="text-left rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                      style={{ background: AMBER_TINT }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: themeColor(i) }} />
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                      <div className="font-serif font-semibold text-sm" style={{ color: NAVY }}>{theme}</div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {list.length} projet{list.length > 1 ? "s" : ""} · {distinctUsers} utilisateur{distinctUsers > 1 ? "s" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Fréquentation par écran</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={160} />
                  <Tooltip />
                  <Bar dataKey="visites" fill={NAVY} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Derniers inscrits</h2>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {users.slice(0, 8).map((u, i) => (
                  <div key={i} className="text-xs border-b border-gray-50 pb-2">
                    <div className="font-medium text-gray-700">{u.email}</div>
                    <div className="text-gray-400">{new Date(u.created_at).toLocaleDateString("fr-FR")} · {u.role}</div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-xs text-gray-400">Aucun utilisateur pour l'instant.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
