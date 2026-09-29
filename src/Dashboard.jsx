import React, { useEffect, useState } from "react";
import {
  Bell, Plus, Upload, ClipboardList, MapPin, Layers, Building2, CalendarDays,
  Inbox, ShieldCheck, ChevronRight,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import Sidebar from "./Sidebar.jsx";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { COMMUNE_COORDS } from "./communeCoords.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";

// Emprise approximative du Bénin, pour une mini-carte cohérente d'une carte à l'autre
const BENIN_BOUNDS = { latMin: 6.2, latMax: 12.5, lonMin: 0.6, lonMax: 3.9 };
const THEME_COLORS = ["#1F3864", "#3E9C6B", "#C99A2E", "#3592C4", "#B5651D", "#6C7DAE", "#B3413A"];

function Watermark() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
      <span className="font-serif font-black whitespace-nowrap select-none"
        style={{ color: NAVY, opacity: 0.06, fontSize: "13vw", letterSpacing: "-0.02em" }}>
        AgriHakStat
      </span>
      <span className="absolute bottom-4 right-6 text-xs font-medium select-none" style={{ color: NAVY, opacity: 0.35 }}>
        Conçu par Hakibou MOUSSA
      </span>
    </div>
  );
}

function MiniMap({ communes }) {
  const points = (communes || []).map((c) => COMMUNE_COORDS[c]).filter(Boolean);
  if (points.length === 0) return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-20 rounded-lg bg-[#F4F6FB]">
      {points.map((p, i) => {
        const x = ((p.lon - BENIN_BOUNDS.lonMin) / (BENIN_BOUNDS.lonMax - BENIN_BOUNDS.lonMin)) * 100;
        const y = 100 - ((p.lat - BENIN_BOUNDS.latMin) / (BENIN_BOUNDS.latMax - BENIN_BOUNDS.latMin)) * 100;
        return <circle key={i} cx={x} cy={y} r={3} fill={NAVY} opacity={0.8} stroke="white" strokeWidth={0.8} />;
      })}
    </svg>
  );
}

function CollecteCard({ p, isAdmin }) {
  const communes = p.communes || [];
  const indicateurs = p.indicateurs || [];
  const themes = p.thematiques || [];
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif font-semibold text-sm leading-snug" style={{ color: NAVY }}>{p.titre || "Collecte sans titre"}</h3>
        <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: "#E4F5EC", color: GREEN }}>{p.statut || "soumis"}</span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
        <Building2 size={12} /> {p.structure || "Structure non renseignée"}
      </div>

      {themes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {themes.slice(0, 4).map((t, i) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#FDF1DA", color: "#8A5A00" }}>{t}</span>
          ))}
        </div>
      )}

      {communes.length > 0 && <MiniMap communes={communes} />}

      <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
        <MapPin size={12} className="mt-0.5 shrink-0" />
        <span>{communes.length > 0 ? communes.slice(0, 3).join(", ") + (communes.length > 3 ? ` +${communes.length - 3}` : "") : "Zone non renseignée"}</span>
      </div>

      {indicateurs.length > 0 && (
        <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
          <Layers size={12} className="mt-0.5 shrink-0" />
          <span>{indicateurs.map((k) => k.nom).filter(Boolean).join(" · ")}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-50">
        <span className="flex items-center gap-1"><CalendarDays size={11} /> {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "—"}</span>
        {isAdmin && <span className="truncate max-w-[140px]">{p.user_email}</span>}
      </div>
    </div>
  );
}

export default function Dashboard({ active, onNavigate, userEmail, userId, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(!isGuest);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) { setLoading(false); return; }
    supabase.from("projets").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setCollectes(data || []);
        setLoading(false);
      });
  }, [isGuest]);

  const communesCouvertes = new Set(collectes.flatMap((p) => p.communes || [])).size;
  const structuresDistinctes = new Set(collectes.map((p) => p.structure).filter(Boolean)).size;
  const derniere = collectes[0]?.created_at ? new Date(collectes[0].created_at).toLocaleDateString("fr-FR") : "—";

  const kpis = [
    { label: isAdmin ? "Collectes (toutes structures)" : "Vos collectes", value: collectes.length, icon: ClipboardList, tint: "#EBEEF7", fg: NAVY },
    { label: "Communes couvertes", value: communesCouvertes, icon: MapPin, tint: "#E4F5EC", fg: GREEN },
    { label: "Structures distinctes", value: structuresDistinctes || (collectes.length ? 1 : 0), icon: Building2, tint: "#FDF1DA", fg: "#8A5A00" },
    { label: "Dernière soumission", value: derniere, icon: CalendarDays, tint: "#F6E9DD", fg: "#8A4A1D" },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <Watermark />
      <div className="relative z-10 flex">
        <Sidebar active={active} onNavigate={onNavigate} />

        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Tableau de bord</h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                {isAdmin ? (<><ShieldCheck size={12} /> Vue administrateur — toutes les collectes, toutes structures</>) : "Vos collectes personnelles"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8">
            <div className="flex gap-3 mb-6">
              <button onClick={() => onNavigate("import")} className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-white shadow-md hover:shadow-lg transition-shadow"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                <Plus size={15} /> Nouvelle collecte
              </button>
              <button onClick={() => onNavigate("import")} className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow bg-white"
                style={{ border: `1.5px solid ${GOLD}`, color: "#8A5A00" }}>
                <Upload size={15} /> Importer une base
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="relative rounded-2xl p-4 overflow-hidden shadow-sm border border-black/5" style={{ background: kpi.tint }}>
                  <kpi.icon size={56} style={{ color: kpi.fg, opacity: 0.08 }} className="absolute -right-3 -bottom-3" />
                  <div className="relative flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: kpi.fg, opacity: 0.85 }}>{kpi.label}</span>
                    <kpi.icon size={16} style={{ color: kpi.fg }} />
                  </div>
                  <div className="relative font-serif text-2xl font-bold" style={{ color: kpi.fg }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {isGuest ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-black/5">
                <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">Mode démonstration — aucune collecte réelle à afficher</p>
                <p className="text-xs text-gray-400 mt-1">Créez un compte pour retrouver ici vos propres collectes, de façon exclusive.</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl p-4 text-sm" style={{ background: "#FBE7E5", color: "#B3413A" }}>{error}</div>
            ) : loading ? (
              <p className="text-sm text-gray-400">Chargement…</p>
            ) : collectes.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-black/5">
                <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">Aucune collecte soumise pour l'instant</p>
                <button onClick={() => onNavigate("import")} className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-md inline-flex items-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                  Importer votre première base <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {collectes.map((p) => <CollecteCard key={p.id} p={p} isAdmin={isAdmin} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
