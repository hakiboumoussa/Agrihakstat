import React, { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { supabase } from "../supabaseClient.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans px-4 relative overflow-hidden">
      <img src="./logo-full.png" alt=""
        className="pointer-events-none select-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] z-0"
        style={{ width: "min(1400px, 160vw)" }} />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-black/5 p-8 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <img src="./logo-compact.png" alt="AgriHakStat" className="w-auto mb-2" style={{ height: "180px" }} />
          <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Nouveau mot de passe</h1>
        </div>

        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: "#3E9C6B" }} />
            <p className="text-sm text-gray-600 mb-4">Votre mot de passe a été mis à jour avec succès.</p>
            <button onClick={onDone} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
              Continuer vers AgriHakStat
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-start gap-2 rounded-xl p-3 mb-4 text-xs" style={{ background: "#FBE7E5", color: "#B3413A" }}>
                <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Nouveau mot de passe</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": GOLD }} placeholder="6 caractères minimum" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Confirmer le mot de passe</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": GOLD }} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-2 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                {loading && <Loader2 size={15} className="animate-spin" />} <KeyRound size={15} /> Mettre à jour le mot de passe
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
