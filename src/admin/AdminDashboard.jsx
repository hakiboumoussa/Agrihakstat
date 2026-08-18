import React, { useEffect, useState } from "react";
import { ArrowLeft, Users, Activity, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "../supabaseClient.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

const SCREEN_LABELS = {
  dashboard: "Tableau de bord", import: "Assistant d'import", config: "Configuration des analyses",
  results: "Résultats & rapport", map: "Cartographie",
};

export default function AdminDashboard({ onBack }) {
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: profiles, error: e1 } = await supabase
        .from("profiles").select("email, role, created_at").order("created_at", { ascending: false });
      const { data: logs, error: e2 } = await supabase
        .from("activity_log").select("screen");
      if (e1 || e2) setError((e1 || e2).message);
      setUsers(profiles || []);
      setActivity(logs || []);
      setLoading(false);
    }
    load();
  }, []);

  const counts = {};
  activity.forEach((a) => { counts[a.screen] = (counts[a.screen] || 0) + 1; });
  const chartData = Object.entries(SCREEN_LABELS).map(([id, label]) => ({ label, visites: counts[id] || 0 }));

  return (
    <div className="min-h-screen bg-[#F4F6FB] font-sans p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6" style={{ color: NAVY }}>
        <ArrowLeft size={15} /> Retour à l'application
      </button>

      <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: NAVY }}>Panneau d'administration</h1>
      <p className="text-sm text-gray-500 mb-6">Utilisateurs inscrits et fréquentation des écrans</p>

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: "#FBE7E5", color: "#B3413A" }}>
          {error}. Vérifiez que le script supabase_setup.sql a bien été exécuté et que votre compte a le rôle « admin ».
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <Users size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{users.length}</div>
              <div className="text-xs text-gray-400">Utilisateurs inscrits</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <Activity size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{activity.length}</div>
              <div className="text-xs text-gray-400">Visites d'écran enregistrées</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <Clock size={18} style={{ color: GOLD }} />
              <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>
                {users[0] ? new Date(users[0].created_at).toLocaleDateString("fr-FR") : "—"}
              </div>
              <div className="text-xs text-gray-400">Dernière inscription</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Thématiques développées — fréquentation par écran</h2>
              <ResponsiveContainer width="100%" height={240}>
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
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
