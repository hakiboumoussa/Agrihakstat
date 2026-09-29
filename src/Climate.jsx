import React, { useState } from "react";
import {
  Bell, CloudRain, Thermometer, Droplets, MapPin, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart,
} from "recharts";
import Sidebar from "./Sidebar.jsx";
import UserMenu from "./UserMenu.jsx";
import { BENIN_DEPARTEMENTS } from "./beninGeo.js";
import { COMMUNE_COORDS } from "./communeCoords.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";
const GREEN = "#256B45";

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}`}>{children}</div>;
}

function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function defaultDates() {
  // NASA POWER accuse un léger différé de publication : on s'arrête 4 jours avant aujourd'hui
  const end = new Date();
  end.setDate(end.getDate() - 4);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { start: toYYYYMMDD(start), end: toYYYYMMDD(end) };
}

export default function Climate({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const defaults = defaultDates();
  const [departement, setDepartement] = useState("Borgou");
  const [commune, setCommune] = useState("Parakou");
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const communesDuDepartement = BENIN_DEPARTEMENTS.find((d) => d.departement === departement)?.communes || [];

  const fetchClimate = async () => {
    const coords = COMMUNE_COORDS[commune];
    if (!coords) { setError("Coordonnées non disponibles pour cette commune."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,T2M&community=AG&longitude=${coords.lon}&latitude=${coords.lat}&start=${startDate}&end=${endDate}&format=JSON`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Le service NASA POWER a répondu avec le code ${res.status}.`);
      const data = await res.json();
      const params = data?.properties?.parameter;
      if (!params) throw new Error(data?.messages?.[0] || "Réponse inattendue du service NASA POWER.");

      const dates = Object.keys(params.PRECTOTCORR || {}).sort();
      const daily = dates.map((d) => ({
        date: `${d.slice(6, 8)}/${d.slice(4, 6)}`,
        pluie: params.PRECTOTCORR[d] === -999 ? null : params.PRECTOTCORR[d],
        tmax: params.T2M_MAX[d] === -999 ? null : params.T2M_MAX[d],
        tmin: params.T2M_MIN[d] === -999 ? null : params.T2M_MIN[d],
      })).filter((d) => d.pluie !== null);

      if (daily.length === 0) throw new Error("Aucune donnée exploitable sur la période demandée (essayez une période plus ancienne).");

      const cumulPluie = daily.reduce((s, d) => s + d.pluie, 0);
      const joursPluie = daily.filter((d) => d.pluie >= 1).length;
      const tMaxAbs = Math.max(...daily.map((d) => d.tmax).filter((v) => v !== null));
      const tMinAbs = Math.min(...daily.map((d) => d.tmin).filter((v) => v !== null));
      const tMoyenne = daily.reduce((s, d) => s + (d.tmax + d.tmin) / 2, 0) / daily.length;

      setResult({ daily, cumulPluie, joursPluie, tMaxAbs, tMinAbs, tMoyenne, n: daily.length });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <div className="flex">
        <Sidebar active={active} onNavigate={onNavigate} />

        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Situation agrométéorologique</h1>
              <p className="text-xs text-gray-500 mt-0.5">Données NASA POWER, par localité — Bénin</p>
            </div>
            <div className="flex items-center gap-4">
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
                Coordonnées approximatives du centre de la commune ({COMMUNE_COORDS[commune]?.lat.toFixed(2)}, {COMMUNE_COORDS[commune]?.lon.toFixed(2)}) · Source : NASA POWER (communauté agroclimatique), publication différée de quelques jours.
              </p>
            </Card>

            {error && (
              <div className="flex items-start gap-2 rounded-xl p-4 mb-5" style={{ background: "#FBE7E5", color: "#B3413A" }}>
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

            {result && (
              <>
                <div className="grid grid-cols-4 gap-4 mb-5">
                  <Card>
                    <CloudRain size={18} style={{ color: GOLD }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.cumulPluie.toFixed(1)} mm</div>
                    <div className="text-xs text-gray-400">Cumul pluviométrique</div>
                  </Card>
                  <Card>
                    <Droplets size={18} style={{ color: GOLD }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.joursPluie} j</div>
                    <div className="text-xs text-gray-400">Jours de pluie (≥ 1 mm) sur {result.n}</div>
                  </Card>
                  <Card>
                    <Thermometer size={18} style={{ color: "#B3413A" }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.tMaxAbs.toFixed(1)} °C</div>
                    <div className="text-xs text-gray-400">Température maximale</div>
                  </Card>
                  <Card>
                    <Thermometer size={18} style={{ color: "#3592C4" }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.tMinAbs.toFixed(1)} °C</div>
                    <div className="text-xs text-gray-400">Température minimale</div>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Précipitations journalières</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={result.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(result.daily.length / 8)} />
                        <YAxis tick={{ fontSize: 11 }} unit=" mm" width={50} />
                        <Tooltip />
                        <Bar dataKey="pluie" fill="#3592C4" radius={[3, 3, 0, 0]} name="Pluie (mm)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card>
                    <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Températures journalières</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={result.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(result.daily.length / 8)} />
                        <YAxis tick={{ fontSize: 11 }} unit="°C" width={45} />
                        <Tooltip />
                        <Line type="monotone" dataKey="tmax" stroke="#B3413A" strokeWidth={2} dot={false} name="T° max" />
                        <Line type="monotone" dataKey="tmin" stroke="#3592C4" strokeWidth={2} dot={false} name="T° min" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
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
