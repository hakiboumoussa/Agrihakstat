import React, { useState } from "react";
import {
  Bell, CloudRain, Thermometer, Droplets, MapPin, Loader2, AlertCircle, RefreshCw, X, Sun, Wind,
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

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
      style={active ? { background: NAVY, borderColor: NAVY, color: "white" } : { background: "white", borderColor: "#D8DEE9", color: "#5A6478" }}
    >
      {label}
    </button>
  );
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
  const [departements, setDepartements] = useState(["Borgou"]);
  const [communes, setCommunes] = useState(["Parakou"]);
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [partialWarning, setPartialWarning] = useState("");
  const [result, setResult] = useState(null);

  const toggleDepartement = (dep) => {
    if (departements.includes(dep)) {
      const communesDeCeDepartement = new Set(BENIN_DEPARTEMENTS.find((d) => d.departement === dep)?.communes || []);
      setCommunes(communes.filter((c) => !communesDeCeDepartement.has(c)));
      setDepartements(departements.filter((d) => d !== dep));
    } else {
      setDepartements([...departements, dep]);
    }
  };
  const toggleCommune = (c) => setCommunes(communes.includes(c) ? communes.filter((x) => x !== c) : [...communes, c]);

  const fetchClimate = async () => {
    if (communes.length === 0) { setError("Sélectionnez au moins une commune."); return; }
    setLoading(true);
    setError("");
    setPartialWarning("");
    setResult(null);

    const outcomes = await Promise.allSettled(
      communes.map(async (commune) => {
        const coords = COMMUNE_COORDS[commune];
        if (!coords) throw new Error(`Coordonnées non disponibles pour ${commune}.`);
        const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,ET0,WS2M&community=AG&longitude=${coords.lon}&latitude=${coords.lat}&start=${startDate}&end=${endDate}&format=JSON`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`code ${res.status}`);
        const data = await res.json();
        const params = data?.properties?.parameter;
        if (!params) throw new Error(data?.messages?.[0] || "réponse inattendue");
        const dates = Object.keys(params.PRECTOTCORR || {}).sort();
        const daily = {};
        dates.forEach((d) => {
          const pluie = params.PRECTOTCORR[d];
          const tmax = params.T2M_MAX[d];
          const tmin = params.T2M_MIN[d];
          const eto = params.ET0?.[d];
          const vent = params.WS2M?.[d];
          daily[d] = {
            pluie: pluie === -999 ? null : pluie,
            tmax: tmax === -999 ? null : tmax,
            tmin: tmin === -999 ? null : tmin,
            eto: eto === -999 || eto === undefined ? null : eto,
            vent: vent === -999 || vent === undefined ? null : vent,
          };
        });
        return { commune, daily };
      })
    );

    const succeeded = outcomes.filter((o) => o.status === "fulfilled").map((o) => o.value);
    const failed = communes.filter((_, i) => outcomes[i].status === "rejected");

    setLoading(false);

    if (succeeded.length === 0) {
      setError("Impossible de récupérer des données pour aucune des communes sélectionnées. Vérifiez votre connexion et réessayez.");
      return;
    }
    if (failed.length > 0) {
      setPartialWarning(`Données indisponibles pour : ${failed.join(", ")}. La moyenne ci-dessous porte uniquement sur ${succeeded.map((s) => s.commune).join(", ")}.`);
    }

    // Fusion : moyenne, jour par jour, entre toutes les communes ayant répondu
    const allDates = new Set();
    succeeded.forEach((s) => Object.keys(s.daily).forEach((d) => allDates.add(d)));
    const sortedDates = [...allDates].sort();

    const daily = sortedDates.map((d) => {
      const pluies = succeeded.map((s) => s.daily[d]?.pluie).filter((v) => v !== null && v !== undefined);
      const tmaxs = succeeded.map((s) => s.daily[d]?.tmax).filter((v) => v !== null && v !== undefined);
      const tmins = succeeded.map((s) => s.daily[d]?.tmin).filter((v) => v !== null && v !== undefined);
      const etos = succeeded.map((s) => s.daily[d]?.eto).filter((v) => v !== null && v !== undefined);
      const vents = succeeded.map((s) => s.daily[d]?.vent).filter((v) => v !== null && v !== undefined);
      return {
        date: `${d.slice(6, 8)}/${d.slice(4, 6)}`,
        pluie: pluies.length ? pluies.reduce((a, b) => a + b, 0) / pluies.length : null,
        tmax: tmaxs.length ? tmaxs.reduce((a, b) => a + b, 0) / tmaxs.length : null,
        tmin: tmins.length ? tmins.reduce((a, b) => a + b, 0) / tmins.length : null,
        eto: etos.length ? etos.reduce((a, b) => a + b, 0) / etos.length : null,
        vent: vents.length ? vents.reduce((a, b) => a + b, 0) / vents.length : null,
      };
    }).filter((d) => d.pluie !== null);

    if (daily.length === 0) {
      setError("Aucune donnée exploitable sur la période demandée (essayez une période plus ancienne).");
      return;
    }

    const cumulPluie = daily.reduce((s, d) => s + d.pluie, 0);
    const joursPluie = daily.filter((d) => d.pluie >= 10).length;
    const tMaxAbs = Math.max(...daily.map((d) => d.tmax).filter((v) => v !== null));
    const tMinAbs = Math.min(...daily.map((d) => d.tmin).filter((v) => v !== null));
    const etoValides = daily.map((d) => d.eto).filter((v) => v !== null);
    const cumulEto = etoValides.length ? etoValides.reduce((a, b) => a + b, 0) : null;
    const ventValides = daily.map((d) => d.vent).filter((v) => v !== null);
    const ventMoyen = ventValides.length ? ventValides.reduce((a, b) => a + b, 0) / ventValides.length : null;

    setResult({ daily, cumulPluie, joursPluie, tMaxAbs, tMinAbs, cumulEto, ventMoyen, n: daily.length, communesUtilisees: succeeded.map((s) => s.commune) });
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
              <p className="text-xs text-gray-500 mt-0.5">Données NASA POWER — moyenne sur zone d'intervention, Bénin</p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8">
            <Card className="mb-5">
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Zone d'intervention — département(s)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {BENIN_DEPARTEMENTS.map((d) => (
                  <Chip key={d.departement} label={d.departement} active={departements.includes(d.departement)} onClick={() => toggleDepartement(d.departement)} />
                ))}
              </div>

              {departements.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic mb-3">Sélectionnez au moins un département pour afficher ses communes.</p>
              ) : (
                <div className="space-y-2 mb-2">
                  {departements.map((dep) => (
                    <div key={dep}>
                      <label className="text-[11px] text-gray-500 block mb-1">Communes de {dep}</label>
                      <div className="flex flex-wrap gap-2">
                        {(BENIN_DEPARTEMENTS.find((d) => d.departement === dep)?.communes || []).map((c) => (
                          <Chip key={c} label={c} active={communes.includes(c)} onClick={() => toggleCommune(c)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {communes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4 pt-2 border-t border-gray-100">
                  {communes.map((c) => (
                    <span key={c} className="text-[11px] px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "#EBEEF7", color: NAVY }}>
                      {c}
                      <button onClick={() => toggleCommune(c)} className="hover:text-red-500"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="col-span-2">
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
                Moyenne calculée jour par jour sur les communes sélectionnées (coordonnées approximatives du centre de chaque commune) · Source : NASA POWER, publication différée de quelques jours.
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

            {partialWarning && (
              <div className="flex items-start gap-2 rounded-xl p-3 mb-5" style={{ background: "#FDF1DA", color: "#8A5A00" }}>
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <p className="text-xs">{partialWarning}</p>
              </div>
            )}

            {result && (
              <>
                <p className="text-xs text-gray-500 mb-3">
                  Moyenne de zone sur <span className="font-medium" style={{ color: NAVY }}>{result.communesUtilisees.length} commune{result.communesUtilisees.length > 1 ? "s" : ""}</span> : {result.communesUtilisees.join(", ")}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <Card>
                    <CloudRain size={18} style={{ color: GOLD }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.cumulPluie.toFixed(1)} mm</div>
                    <div className="text-xs text-gray-400">Cumul pluviométrique (moyenne de zone)</div>
                  </Card>
                  <Card>
                    <Droplets size={18} style={{ color: GOLD }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.joursPluie} j</div>
                    <div className="text-xs text-gray-400">Jours de pluie (≥ 10 mm) sur {result.n}</div>
                  </Card>
                  <Card>
                    <Thermometer size={18} style={{ color: "#B3413A" }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.tMaxAbs.toFixed(1)} °C</div>
                    <div className="text-xs text-gray-400">Température maximale (moyenne de zone)</div>
                  </Card>
                  <Card>
                    <Thermometer size={18} style={{ color: "#3592C4" }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.tMinAbs.toFixed(1)} °C</div>
                    <div className="text-xs text-gray-400">Température minimale (moyenne de zone)</div>
                  </Card>
                  <Card>
                    <Sun size={18} style={{ color: "#C9832E" }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.cumulEto !== null ? `${result.cumulEto.toFixed(1)} mm` : "ND"}</div>
                    <div className="text-xs text-gray-400">Évapotranspiration cumulée (ET0)</div>
                  </Card>
                  <Card>
                    <Wind size={18} style={{ color: "#3E9C6B" }} />
                    <div className="font-serif text-2xl font-bold mt-2" style={{ color: NAVY }}>{result.ventMoyen !== null ? `${result.ventMoyen.toFixed(1)} m/s` : "ND"}</div>
                    <div className="text-xs text-gray-400">Vitesse du vent à 2 m (moyenne)</div>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Précipitations journalières (moyenne de zone)</h2>
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
                    <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Températures journalières (moyenne de zone)</h2>
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
                  <Card>
                    <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Évapotranspiration journalière — ET0 (moyenne de zone)</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={result.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(result.daily.length / 8)} />
                        <YAxis tick={{ fontSize: 11 }} unit=" mm" width={50} />
                        <Tooltip />
                        <Bar dataKey="eto" fill="#C9832E" radius={[3, 3, 0, 0]} name="ET0 (mm)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card>
                    <h2 className="font-serif font-semibold mb-3" style={{ color: NAVY }}>Vitesse du vent à 2 m (moyenne de zone)</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={result.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(result.daily.length / 8)} />
                        <YAxis tick={{ fontSize: 11 }} unit=" m/s" width={50} />
                        <Tooltip />
                        <Line type="monotone" dataKey="vent" stroke="#3E9C6B" strokeWidth={2} dot={false} name="Vent (m/s)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </>
            )}

            {!result && !error && !loading && (
              <Card className="text-center py-12">
                <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Choisissez une ou plusieurs communes et une période, puis cliquez « Afficher ».</p>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
