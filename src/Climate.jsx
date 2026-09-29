import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Bell, CloudRain, Thermometer, Droplets, MapPin, Loader2, AlertCircle, RefreshCw,
  Download, Sprout, Waves, Sun, TriangleAlert, Info,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart,
  ComposedChart, Legend, ReferenceLine,
} from "recharts";
import Sidebar from "./Sidebar.jsx";
import UserMenu from "./UserMenu.jsx";
import { BENIN_DEPARTEMENTS } from "./beninGeo.js";
import { COMMUNE_COORDS } from "./communeCoords.js";
import {
  CROP_KC_TABLE, computeWaterBalance, computeCropWaterSatisfaction, detectDrySpells, aggregateByPeriod,
} from "./agroClimate.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";
const GREEN_TINT = "#E4F5EC";
const AMBER = "#8A5A00";
const AMBER_TINT = "#FDF1DA";
const RED = "#B3413A";
const RED_TINT = "#FBE7E5";
const NAVY_TINT = "#EBEEF7";

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}`}>{children}</div>;
}

function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function defaultDates() {
  // NASA POWER et Open-Meteo accusent un léger différé de publication : on s'arrête 5 jours avant aujourd'hui
  const end = new Date();
  end.setDate(end.getDate() - 5);
  const start = new Date(end);
  start.setDate(start.getDate() - 89); // 3 mois par défaut, pour une lecture saisonnière pertinente
  return { start: toYYYYMMDD(start), end: toYYYYMMDD(end) };
}

function StatusPill({ statut }) {
  const map = {
    "Besoins satisfaits": { bg: GREEN_TINT, color: GREEN },
    "Stress modéré": { bg: AMBER_TINT, color: AMBER },
    "Stress sévère": { bg: RED_TINT, color: RED },
    "Données insuffisantes": { bg: "#F1F2F6", color: "#8891A5" },
  };
  const s = map[statut] || map["Données insuffisantes"];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {statut}
    </span>
  );
}

export default function Climate({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const defaults = defaultDates();
  const [departement, setDepartement] = useState("Borgou");
  const [commune, setCommune] = useState("Parakou");
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [et0Error, setEt0Error] = useState("");
  const [result, setResult] = useState(null);
  const [view, setView] = useState("jour"); // jour | mois | trimestre
  const [cropKey, setCropKey] = useState("mais");
  const [sowingDate, setSowingDate] = useState("");
  const [drySpellMinLength, setDrySpellMinLength] = useState(7);

  const communesDuDepartement = BENIN_DEPARTEMENTS.find((d) => d.departement === departement)?.communes || [];

  const fetchClimate = async () => {
    const coords = COMMUNE_COORDS[commune];
    if (!coords) { setError("Coordonnées non disponibles pour cette commune."); return; }
    setLoading(true);
    setError("");
    setEt0Error("");
    setResult(null);
    try {
      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,T2M&community=AG&longitude=${coords.lon}&latitude=${coords.lat}&start=${startDate}&end=${endDate}&format=JSON`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Le service NASA POWER a répondu avec le code ${res.status}.`);
      const data = await res.json();
      const params = data?.properties?.parameter;
      if (!params) throw new Error(data?.messages?.[0] || "Réponse inattendue du service NASA POWER.");

      const dates = Object.keys(params.PRECTOTCORR || {}).sort();
      let daily = dates.map((d) => ({
        dateISO: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
        date: `${d.slice(6, 8)}/${d.slice(4, 6)}`,
        pluie: params.PRECTOTCORR[d] === -999 ? null : params.PRECTOTCORR[d],
        tmax: params.T2M_MAX[d] === -999 ? null : params.T2M_MAX[d],
        tmin: params.T2M_MIN[d] === -999 ? null : params.T2M_MIN[d],
        et0: null,
      })).filter((d) => d.pluie !== null);

      if (daily.length === 0) throw new Error("Aucune donnée exploitable sur la période demandée (essayez une période plus ancienne).");

      // Évapotranspiration de référence (ET0, méthode FAO-56 Penman-Monteith) — Open-Meteo Archive API.
      // Récupérée séparément : un échec sur cette source ne doit pas empêcher l'affichage de la pluie et
      // des températures, qui restent la donnée principale.
      try {
        const isoStart = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
        const isoEnd = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;
        const omUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${isoStart}&end_date=${isoEnd}&daily=et0_fao_evapotranspiration&timezone=UTC`;
        const omRes = await fetch(omUrl);
        if (!omRes.ok) throw new Error(`Le service Open-Meteo a répondu avec le code ${omRes.status}.`);
        const omData = await omRes.json();
        const omDates = omData?.daily?.time || [];
        const omEt0 = omData?.daily?.et0_fao_evapotranspiration || [];
        const et0ByDate = new Map(omDates.map((d, i) => [d, omEt0[i]]));
        daily = daily.map((d) => ({ ...d, et0: et0ByDate.has(d.dateISO) && et0ByDate.get(d.dateISO) !== null ? et0ByDate.get(d.dateISO) : null }));
      } catch (e) {
        setEt0Error("Évapotranspiration (ET0) indisponible pour cette période/localité (service Open-Meteo) : " + e.message + " — le bilan hydrique et l'analyse par culture ne peuvent pas être calculés tant que cette donnée manque.");
      }

      daily = computeWaterBalance(daily);

      const cumulPluie = daily.reduce((s, d) => s + (d.pluie || 0), 0);
      const joursPluie = daily.filter((d) => d.pluie >= 1).length;
      const tMaxAbs = Math.max(...daily.map((d) => d.tmax).filter((v) => v !== null));
      const tMinAbs = Math.min(...daily.map((d) => d.tmin).filter((v) => v !== null));
      const tMoyenne = daily.reduce((s, d) => s + (d.tmax + d.tmin) / 2, 0) / daily.length;
      const et0Cumule = daily.reduce((s, d) => s + (d.et0 || 0), 0);
      const bilanNet = daily.length > 0 ? daily[daily.length - 1].bilanCumule : null;
      const drySpells = detectDrySpells(daily, 1, Number(drySpellMinLength) || 7);

      setResult({ daily, cumulPluie, joursPluie, tMaxAbs, tMinAbs, tMoyenne, n: daily.length, et0Cumule, bilanNet, drySpells });
      if (!sowingDate) setSowingDate(daily[0]?.dateISO || "");
    } catch (e) {
      if (e instanceof TypeError) {
        setError("Impossible de joindre le service NASA POWER (connexion réseau ou blocage temporaire). Vérifiez votre connexion internet et réessayez dans quelques instants.");
      } else {
        setError(e.message || "Échec de la récupération des données climatiques.");
      }
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = useMemo(() => (result ? aggregateByPeriod(result.daily, "mois") : []), [result]);
  const quarterlyData = useMemo(() => (result ? aggregateByPeriod(result.daily, "trimestre") : []), [result]);
  const periodData = view === "jour" ? result?.daily : view === "mois" ? monthlyData : quarterlyData;
  const periodKey = view === "jour" ? "date" : "periode";

  const ombroMax = useMemo(() => {
    if (monthlyData.length === 0) return { temp: 40, pluie: 80 };
    const maxTemp = Math.max(...monthlyData.map((m) => m.tmoyenne || 0));
    return { temp: Math.ceil((maxTemp * 1.2) / 5) * 5, pluie: Math.ceil((maxTemp * 1.2 * 2) / 20) * 20 };
  }, [monthlyData]);

  const cropAnalysis = useMemo(() => {
    if (!result || !sowingDate || !cropKey) return null;
    return computeCropWaterSatisfaction(result.daily, cropKey, sowingDate);
  }, [result, sowingDate, cropKey]);

  const drySpellsRecalc = useMemo(() => {
    if (!result) return null;
    return detectDrySpells(result.daily, 1, Number(drySpellMinLength) || 7);
  }, [result, drySpellMinLength]);

  const exportExcel = () => {
    if (!result) return;
    const rows = result.daily.map((d) => ({
      Date: d.dateISO,
      "Pluie (mm)": d.pluie !== null ? Number(d.pluie.toFixed(2)) : "",
      "T° max (°C)": d.tmax !== null ? Number(d.tmax.toFixed(2)) : "",
      "T° min (°C)": d.tmin !== null ? Number(d.tmin.toFixed(2)) : "",
      "ET0 (mm)": d.et0 !== null && d.et0 !== undefined ? Number(d.et0.toFixed(2)) : "",
      "Bilan du jour P-ET0 (mm)": d.bilanJour !== null && d.bilanJour !== undefined ? Number(d.bilanJour.toFixed(2)) : "",
      "Bilan cumulé (mm)": d.bilanCumule !== null && d.bilanCumule !== undefined ? Number(d.bilanCumule.toFixed(2)) : "",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Données journalières");

    const wsMeta = XLSX.utils.json_to_sheet([{
      Commune: commune, Département: departement,
      Latitude: COMMUNE_COORDS[commune]?.lat, Longitude: COMMUNE_COORDS[commune]?.lon,
      "Période de début": startDate, "Période de fin": endDate,
      "Cumul pluviométrique (mm)": Number(result.cumulPluie.toFixed(1)),
      "ET0 cumulée (mm)": Number(result.et0Cumule.toFixed(1)),
      "Sources": "NASA POWER (pluie, températures) · Open-Meteo Archive API (ET0, FAO-56 Penman-Monteith)",
    }]);
    XLSX.utils.book_append_sheet(wb, wsMeta, "Métadonnées");

    XLSX.writeFile(wb, `AgroMeteo_${commune}_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <div className="flex">
        <Sidebar active={active} onNavigate={onNavigate} />

        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Situation agrométéorologique</h1>
              <p className="text-xs text-gray-500 mt-0.5">Données NASA POWER &amp; Open-Meteo, par localité — Bénin</p>
            </div>
            <div className="flex items-center gap-4">
              {result && (
                <button onClick={exportExcel}
                  className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white"
                  style={{ background: GREEN }}>
                  <Download size={13} /> Extraire les données (.xlsx)
                </button>
              )}
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8">
            <Card className="mb-5">
              <div className="grid grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Département</label>
                  <select value={departement} onChange={(e) => { setDepartement(e.target.value); setCommune(BENIN_DEPARTEMENTS.find((d) => d.departement === e.target.value).communes[0]); }}
                    className="w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }}>
                    {BENIN_DEPARTEMENTS.map((d) => <option key={d.departement} value={d.departement}>{d.departement}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Commune</label>
                  <select value={commune} onChange={(e) => setCommune(e.target.value)}
                    className="w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }}>
                    {communesDuDepartement.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Période</label>
                  <div className="flex items-center gap-1.5">
                    <input type="date" value={`${startDate.slice(0,4)}-${startDate.slice(4,6)}-${startDate.slice(6,8)}`}
                      onChange={(e) => setStartDate(e.target.value.replace(/-/g, ""))}
                      className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
                    <input type="date" value={`${endDate.slice(0,4)}-${endDate.slice(4,6)}-${endDate.slice(6,8)}`}
                      onChange={(e) => setEndDate(e.target.value.replace(/-/g, ""))}
                      className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
                  </div>
                </div>
                <button onClick={fetchClimate} disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-white shadow-md disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Afficher
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Coordonnées approximatives du centre de la commune ({COMMUNE_COORDS[commune]?.lat.toFixed(2)}, {COMMUNE_COORDS[commune]?.lon.toFixed(2)}) · Pluie et températures : NASA POWER (communauté agroclimatique) · Évapotranspiration de référence (ET0) : Open-Meteo, méthode FAO-56 Penman-Monteith — publication différée de quelques jours.
              </p>
            </Card>

            {error && (
              <div className="flex items-start gap-2 rounded-xl p-4 mb-5" style={{ background: RED_TINT, color: RED }}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p>{error}</p>
                  <a href={`https://power.larc.nasa.gov/data-access-viewer/`} target="_blank" rel="noreferrer"
                    className="underline font-medium inline-block mt-1">
                    Consulter directement le site NASA POWER
                  </a>
                </div>
              </div>
            )}

            {et0Error && (
              <div className="flex items-start gap-2 rounded-xl p-3 mb-5" style={{ background: AMBER_TINT, color: AMBER }}>
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <p className="text-xs">{et0Error}</p>
              </div>
            )}

            {result && (
              <>
                {/* KPI */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
                  <Card>
                    <CloudRain size={18} style={{ color: GOLD }} />
                    <div className="font-serif text-xl font-bold mt-2" style={{ color: NAVY }}>{result.cumulPluie.toFixed(1)} mm</div>
                    <div className="text-xs text-gray-400">Cumul pluviométrique</div>
                  </Card>
                  <Card>
                    <Droplets size={18} style={{ color: GOLD }} />
                    <div className="font-serif text-xl font-bold mt-2" style={{ color: NAVY }}>{result.joursPluie} j</div>
                    <div className="text-xs text-gray-400">Jours de pluie (≥ 1 mm) sur {result.n}</div>
                  </Card>
                  <Card>
                    <Thermometer size={18} style={{ color: RED }} />
                    <div className="font-serif text-xl font-bold mt-2" style={{ color: NAVY }}>{result.tMaxAbs.toFixed(1)} °C</div>
                    <div className="text-xs text-gray-400">Température maximale</div>
                  </Card>
                  <Card>
                    <Thermometer size={18} style={{ color: "#3592C4" }} />
                    <div className="font-serif text-xl font-bold mt-2" style={{ color: NAVY }}>{result.tMinAbs.toFixed(1)} °C</div>
                    <div className="text-xs text-gray-400">Température minimale</div>
                  </Card>
                  <Card>
                    <Sun size={18} style={{ color: "#B5651D" }} />
                    <div className="font-serif text-xl font-bold mt-2" style={{ color: NAVY }}>
                      {result.et0Cumule > 0 ? `${result.et0Cumule.toFixed(1)} mm` : "—"}
                    </div>
                    <div className="text-xs text-gray-400">ET0 cumulée</div>
                  </Card>
                  <Card>
                    <Waves size={18} style={{ color: result.bilanNet >= 0 ? GREEN : RED }} />
                    <div className="font-serif text-xl font-bold mt-2" style={{ color: result.bilanNet >= 0 ? GREEN : RED }}>
                      {result.bilanNet !== null ? `${result.bilanNet >= 0 ? "+" : ""}${result.bilanNet.toFixed(1)} mm` : "—"}
                    </div>
                    <div className="text-xs text-gray-400">Bilan hydrique net (P − ET0)</div>
                  </Card>
                </div>

                {/* Vue Jour / Mois / Trimestre */}
                <Card className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Précipitations et températures</h2>
                    <div className="flex gap-1.5">
                      {[["jour", "Jour"], ["mois", "Cumul mensuel"], ["trimestre", "Cumul trimestriel"]].map(([k, l]) => (
                        <button key={k} onClick={() => setView(k)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={view === k ? { background: NAVY, color: "white" } : { background: "#F1F2F6", color: "#5A6478" }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">{view === "jour" ? "Pluie journalière (mm)" : `Pluie cumulée par ${view} (mm)`}</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={periodData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                          <XAxis dataKey={periodKey} tick={{ fontSize: 10 }} interval={view === "jour" ? Math.ceil((periodData?.length || 1) / 8) : 0} />
                          <YAxis tick={{ fontSize: 11 }} unit=" mm" width={50} />
                          <Tooltip />
                          <Bar dataKey="pluie" fill="#3592C4" radius={[3, 3, 0, 0]} name="Pluie (mm)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">{view === "jour" ? "Températures journalières (°C)" : `Température moyenne par ${view} (°C)`}</p>
                      <ResponsiveContainer width="100%" height={220}>
                        {view === "jour" ? (
                          <LineChart data={periodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil((periodData?.length || 1) / 8)} />
                            <YAxis tick={{ fontSize: 11 }} unit="°C" width={45} />
                            <Tooltip />
                            <Line type="monotone" dataKey="tmax" stroke={RED} strokeWidth={2} dot={false} name="T° max" />
                            <Line type="monotone" dataKey="tmin" stroke="#3592C4" strokeWidth={2} dot={false} name="T° min" />
                          </LineChart>
                        ) : (
                          <LineChart data={periodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                            <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 11 }} unit="°C" width={45} />
                            <Tooltip />
                            <Line type="monotone" dataKey="tmoyenne" stroke={RED} strokeWidth={2} dot name="T° moyenne" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>

                {/* Diagramme ombrothermique */}
                <Card className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun size={16} style={{ color: GOLD }} />
                    <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Diagramme ombrothermique (Gaussen)</h2>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Convention de Gaussen : un mois est considéré sec lorsque le cumul pluviométrique (mm) descend sous le double de la température moyenne (°C) — zone grisée sur le graphique.
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                      <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="temp" tick={{ fontSize: 11 }} unit="°C" width={45} domain={[0, ombroMax.temp]} />
                      <YAxis yAxisId="pluie" orientation="right" tick={{ fontSize: 11 }} unit=" mm" width={50} domain={[0, ombroMax.pluie]} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="pluie" dataKey="pluie" fill="#A9C7E8" name="Pluie cumulée (mm)" radius={[3, 3, 0, 0]} />
                      <Line yAxisId="temp" type="monotone" dataKey="tmoyenne" stroke={RED} strokeWidth={2.5} name="Température moyenne (°C)" dot />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>

                {/* Bilan hydrique */}
                <Card className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Waves size={16} style={{ color: "#3592C4" }} />
                    <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Bilan hydrique séquentiel (P − ET0)</h2>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Bilan cumulé = somme courante de (pluie − ET0) depuis le début de la période affichée. Une valeur positive indique un excédent hydrique disponible, une valeur négative un déficit. Estimation simplifiée, sans prise en compte de la réserve utile du sol ni du ruissellement.
                  </p>
                  {result.daily.some((d) => d.et0 !== null) ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={result.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(result.daily.length / 8)} />
                        <YAxis tick={{ fontSize: 11 }} unit=" mm" width={55} />
                        <Tooltip />
                        <ReferenceLine y={0} stroke="#B0B7C6" strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="bilanCumule" stroke={GREEN} strokeWidth={2} dot={false} name="Bilan cumulé (mm)" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="rounded-xl p-3 text-xs text-gray-400 italic" style={{ background: "#F7F8FA" }}>
                      Le bilan hydrique ne peut pas être calculé : l'évapotranspiration de référence (ET0) n'a pas pu être récupérée pour cette période.
                    </div>
                  )}
                </Card>

                {/* Séquences sèches */}
                <Card className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <TriangleAlert size={16} style={{ color: AMBER }} />
                      <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Séquences sèches</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      Seuil de signalement :
                      <input type="number" min={2} max={30} value={drySpellMinLength}
                        onChange={(e) => setDrySpellMinLength(e.target.value)}
                        className="w-16 text-xs rounded-lg border border-gray-200 p-1.5 focus:outline-none" />
                      jours consécutifs sans pluie utile (&lt; 1 mm)
                    </div>
                  </div>
                  {drySpellsRecalc && drySpellsRecalc.significant.length > 0 ? (
                    <>
                      <p className="text-xs text-gray-500 mb-3">
                        {drySpellsRecalc.countSignificant} séquence{drySpellsRecalc.countSignificant > 1 ? "s" : ""} sèche{drySpellsRecalc.countSignificant > 1 ? "s" : ""} significative{drySpellsRecalc.countSignificant > 1 ? "s" : ""} détectée{drySpellsRecalc.countSignificant > 1 ? "s" : ""} sur la période — la plus longue dure {drySpellsRecalc.longest?.length} jours ({drySpellsRecalc.longest?.start} → {drySpellsRecalc.longest?.end}).
                      </p>
                      <div className="space-y-1.5">
                        {drySpellsRecalc.significant.slice(0, 8).map((s, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs" style={{ background: AMBER_TINT }}>
                            <span style={{ color: AMBER }}>Du {s.start} au {s.end}</span>
                            <span className="font-semibold" style={{ color: AMBER }}>{s.length} jours</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl p-3 text-xs text-gray-400 italic" style={{ background: "#F7F8FA" }}>
                      Aucune séquence sèche d'au moins {drySpellMinLength} jours consécutifs détectée sur la période.
                    </div>
                  )}
                </Card>

                {/* Analyse par culture */}
                <Card>
                  <div className="flex items-center gap-2 mb-1">
                    <Sprout size={16} style={{ color: GREEN }} />
                    <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Satisfaction des besoins en eau par culture</h2>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Méthode des coefficients culturaux (Kc) — FAO Irrigation and Drainage Paper n°56 (Allen et al., 1998), valeurs indicatives pour la zone soudano-guinéenne. ETc = Kc × ET0 ; indice de satisfaction = pluie décadaire / ETc décadaire.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">Culture</label>
                      <select value={cropKey} onChange={(e) => setCropKey(e.target.value)}
                        className="w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none">
                        {Object.entries(CROP_KC_TABLE).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">Date de semis</label>
                      <input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)}
                        className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none" />
                    </div>
                    {cropAnalysis && (
                      <div className="rounded-xl p-3 flex flex-col justify-center" style={{ background: NAVY_TINT }}>
                        <span className="text-[11px] text-gray-500">Fin de cycle estimée</span>
                        <span className="text-sm font-semibold" style={{ color: NAVY }}>{cropAnalysis.dateFinCycleISO} ({cropAnalysis.cycleLength} j)</span>
                      </div>
                    )}
                  </div>

                  {!result.daily.some((d) => d.et0 !== null) ? (
                    <div className="rounded-xl p-3 text-xs text-gray-400 italic" style={{ background: "#F7F8FA" }}>
                      L'analyse par culture nécessite l'évapotranspiration de référence (ET0), indisponible pour cette période.
                    </div>
                  ) : cropAnalysis && cropAnalysis.decades.length > 0 ? (
                    <>
                      <div className="rounded-xl p-3 mb-4 flex items-center gap-3" style={{ background: cropAnalysis.iseGlobal >= 1 ? GREEN_TINT : cropAnalysis.iseGlobal >= 0.5 ? AMBER_TINT : RED_TINT }}>
                        <Info size={15} style={{ color: cropAnalysis.iseGlobal >= 1 ? GREEN : cropAnalysis.iseGlobal >= 0.5 ? AMBER : RED }} />
                        <p className="text-xs" style={{ color: cropAnalysis.iseGlobal >= 1 ? GREEN : cropAnalysis.iseGlobal >= 0.5 ? AMBER : RED }}>
                          Sur la portion du cycle couverte par les données disponibles : {cropAnalysis.totalPluie.toFixed(0)} mm de pluie pour {cropAnalysis.totalEtc.toFixed(0)} mm de besoins (ETc) — indice de satisfaction global {cropAnalysis.iseGlobal !== null ? cropAnalysis.iseGlobal.toFixed(2) : "—"}.
                          {cropAnalysis.periodesStress.length > 0 && ` ${cropAnalysis.periodesStress.length} décade(s) en situation de déficit hydrique.`}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="text-xs w-full">
                          <thead>
                            <tr>
                              <th className="text-left text-[10px] text-gray-400 uppercase pb-2">Période (décade)</th>
                              <th className="text-left text-[10px] text-gray-400 uppercase pb-2">Stade</th>
                              <th className="text-right text-[10px] text-gray-400 uppercase pb-2">Pluie (mm)</th>
                              <th className="text-right text-[10px] text-gray-400 uppercase pb-2">ETc (mm)</th>
                              <th className="text-right text-[10px] text-gray-400 uppercase pb-2">ISE</th>
                              <th className="text-right text-[10px] text-gray-400 uppercase pb-2">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cropAnalysis.decades.map((d, i) => (
                              <tr key={i} className="border-t border-gray-50">
                                <td className="py-1.5 text-gray-700">{d.dateDebut} → {d.dateFin}</td>
                                <td className="py-1.5 text-gray-500">{d.stage}</td>
                                <td className="py-1.5 text-right text-gray-700">{d.pluieCumul.toFixed(1)}</td>
                                <td className="py-1.5 text-right text-gray-700">{d.etcCumul.toFixed(1)}</td>
                                <td className="py-1.5 text-right font-mono text-gray-600">{d.ise !== null ? d.ise.toFixed(2) : "—"}</td>
                                <td className="py-1.5 text-right"><StatusPill statut={d.statut} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl p-3 text-xs text-gray-400 italic" style={{ background: "#F7F8FA" }}>
                      Choisissez une date de semis comprise dans (ou proche de) la période importée pour lancer l'analyse.
                    </div>
                  )}
                </Card>
              </>
            )}

            {!result && !error && !loading && (
              <Card className="text-center py-12">
                <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Choisissez une commune et une période, puis cliquez « Afficher ».</p>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
