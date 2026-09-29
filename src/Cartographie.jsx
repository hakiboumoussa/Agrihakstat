import React, { useState, useRef, useEffect, useMemo } from "react";
import L from "leaflet";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, MapPin, Layers, Droplets, Download, FileOutput, Filter,
  Waves, Route as RouteIcon, Home, Satellite, Mountain, Map as MapIcon, Loader2, AlertCircle,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import Sidebar from "./Sidebar.jsx";
import { COMMUNE_COORDS } from "./communeCoords.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

const FILIERES = {
  Soja: "#3E9C6B", Maïs: "#F0AC1B", Riz: "#3592C4", Manioc: "#B5651D", Coton: "#6C7DAE",
};
const FILIERE_PALETTE = ["#6C7DAE", "#F0AC1B", "#3592C4", "#B5651D", "#3E9C6B", "#C9832E", "#8A6BB5", "#B3413A"];

const nav = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: BarChart3 },
  { id: "results", label: "Résultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
];

// Données de suivi interne illustratives pour les 8 communes du Borgou, projetées sur leurs
// coordonnées géographiques réelles (COMMUNE_COORDS) plutôt que sur une position schématique.
const COMMUNES = [
  { name: "Sinendé", mm: 108, taux: 84, rendement: 1720, anomalies: 0 },
  { name: "Kalalé", mm: 101, taux: 79, rendement: 1650, anomalies: 1 },
  { name: "Bembéréké", mm: 95, taux: 88, rendement: 1810, anomalies: 0 },
  { name: "N'Dali", mm: 84, taux: 91, rendement: 1900, anomalies: 0 },
  { name: "Pérèrè", mm: 61, taux: 62, rendement: 1120, anomalies: 2 },
  { name: "Parakou", mm: 76, taux: 86, rendement: 1780, anomalies: 0 },
  { name: "Nikki", mm: 89, taux: 83, rendement: 1690, anomalies: 1 },
  { name: "Tchaourou", mm: 58, taux: 58, rendement: 1080, anomalies: 4 },
];

// ---------- Fonds de carte (tuiles) ----------
// « Satellite » sert d'approximation visuelle pratique de la couverture végétale (imagerie
// réelle), en l'absence d'un service de classification d'occupation du sol (NDVI/land-cover)
// accessible sans clé d'API dans cet environnement — à ne pas confondre avec une classification
// scientifique de l'occupation des sols.
const BASE_LAYERS = {
  clair: {
    label: "Fond clair", icon: MapIcon,
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd", maxZoom: 19,
  },
  osm: {
    label: "Plan (OpenStreetMap)", icon: RouteIcon,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abc", maxZoom: 19,
  },
  satellite: {
    label: "Satellite (couverture végétale)", icon: Satellite,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri — Source : Esri, Maxar, Earthstar Geographics",
    subdomains: "", maxZoom: 19,
  },
  relief: {
    label: "Relief", icon: Mountain,
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Données : &copy; OpenStreetMap contributors, SRTM — Rendu : &copy; OpenTopoMap (CC-BY-SA)',
    subdomains: "abc", maxZoom: 17,
  },
};

function rainColor(mm) {
  if (mm < 65) return "#C99A2E";
  if (mm < 80) return "#8FAECB";
  if (mm < 95) return "#4A7AB5";
  return "#1F3864";
}

function tauxColor(taux) {
  if (taux < 65) return "#C1573F";
  if (taux < 80) return "#E3A23B";
  return "#3E9C6B";
}

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

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}`}>{children}</div>;
}

function Chip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
      style={active ? { background: color || NAVY, borderColor: color || NAVY, color: "white" } : { background: "white", borderColor: "#D8DEE9", color: "#5A6478" }}
    >
      {label}
    </button>
  );
}

function LayerToggle({ label, icon: Icon, checked, onChange, status, color }) {
  return (
    <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer text-sm select-none"
      style={checked ? { background: "#EBEEF7", borderColor: NAVY } : { background: "white", borderColor: "#E4E6ED" }}>
      <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded" style={{ accentColor: color || NAVY }} />
      <Icon size={15} style={{ color: color || "#5A6478" }} />
      <span className="flex-1 text-gray-700">{label}</span>
      {status === "loading" && <Loader2 size={13} className="animate-spin text-gray-400" />}
      {status === "error" && <AlertCircle size={13} className="text-red-400" />}
      {status === "zoom" && <span className="text-[10px] text-gray-400 italic">zoomer</span>}
    </label>
  );
}

// Interroge l'API Overpass (base de données OpenStreetMap) pour les voies d'eau ou les routes
// principales dans l'emprise actuellement affichée par la carte. « out geom » renvoie directement
// la géométrie de chaque tronçon, sans étape de conversion GeoJSON supplémentaire.
async function fetchOverpassWays(kind, bounds, signal) {
  const s = bounds.getSouth().toFixed(4), w = bounds.getWest().toFixed(4);
  const n = bounds.getNorth().toFixed(4), e = bounds.getEast().toFixed(4);
  const filter = kind === "rivers"
    ? 'way["waterway"~"^(river|stream|canal)$"]'
    : 'way["highway"~"^(motorway|trunk|primary|secondary)$"]';
  const query = `[out:json][timeout:25];(${filter}(${s},${w},${n},${e});); out geom;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
    signal,
  });
  if (!res.ok) throw new Error(`Overpass a répondu avec le code ${res.status}`);
  const data = await res.json();
  return data.elements || [];
}

export default function Cartographie({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin, dataset }) {
  const [baseLayerKey, setBaseLayerKey] = useState("clair");
  const [showRivers, setShowRivers] = useState(false);
  const [showRoads, setShowRoads] = useState(false);
  const [showHabitats, setShowHabitats] = useState(true);
  const [showSuivi, setShowSuivi] = useState(true);
  const [showSurvey, setShowSurvey] = useState(true);
  const [indicateur, setIndicateur] = useState("taux");
  const [filieres, setFilieres] = useState(Object.keys(FILIERES));
  const [riversStatus, setRiversStatus] = useState(null);
  const [roadsStatus, setRoadsStatus] = useState(null);

  const toggleFiliere = (f) =>
    setFilieres((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const indicateurLabel = { taux: "Taux de réalisation (%)", rendement: "Rendement moyen (kg/ha)", anomalies: "Anomalies détectées", pluvio: "Pluviométrie décadaire (mm)" }[indicateur];
  const indicateurValue = (c) => (indicateur === "taux" ? `${c.taux}%` : indicateur === "rendement" ? `${c.rendement}` : indicateur === "pluvio" ? `${c.mm}` : c.anomalies);
  const indicateurColor = (c) => (
    indicateur === "anomalies" ? (c.anomalies > 1 ? "#C1573F" : c.anomalies === 1 ? "#E3A23B" : "#3E9C6B")
      : indicateur === "pluvio" ? rainColor(c.mm)
      : indicateur === "taux" ? tauxColor(c.taux) : tauxColor((c.rendement / 2000) * 100)
  );

  // ---------- Détection et projection des vraies coordonnées géographiques importées ----------
  const geoCols = dataset ? dataset.columns.filter((c) => c.isGeo) : [];
  const latCol = geoCols.find((c) => /lat/i.test(c.name));
  const lonCol = geoCols.find((c) => /lon|lng/i.test(c.name));
  const hasRealGeo = !!(dataset && latCol && lonCol);

  const { realPoints, colorCol, realColorMap } = useMemo(() => {
    if (!hasRealGeo) return { realPoints: [], colorCol: null, realColorMap: {} };
    const rawPoints = dataset.rows
      .map((r) => ({ lat: Number(r[latCol.name]), lon: Number(r[lonCol.name]), row: r }))
      .filter((p) => !isNaN(p.lat) && !isNaN(p.lon));
    const cCol = dataset.columns.find((c) => !c.isQuantitative && !c.isGeo && c.modalites && c.modalites.length <= 8) || null;
    const cMap = {};
    if (cCol) cCol.modalites.forEach((m, i) => { cMap[m] = FILIERE_PALETTE[i % FILIERE_PALETTE.length]; });
    return {
      realPoints: rawPoints.map((p, i) => ({ id: i, lat: p.lat, lon: p.lon, color: cCol ? (cMap[p.row[cCol.name]] || "#8A93A8") : NAVY, label: cCol ? p.row[cCol.name] : null })),
      colorCol: cCol, realColorMap: cMap,
    };
  }, [hasRealGeo, dataset, latCol, lonCol]);

  // ---------- Carte Leaflet (monde, scrollable/zoomable) ----------
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const baseTileRef = useRef(null);
  const groupsRef = useRef({});
  const overpassAbortRef = useRef({ rivers: null, roads: null });

  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return;
    const map = L.map(mapDivRef.current, { center: [9.5, 2.3], zoom: 7, minZoom: 2, maxZoom: 19, worldCopyJump: true });
    mapRef.current = map;
    groupsRef.current = {
      rivers: L.layerGroup(), roads: L.layerGroup(),
      habitats: L.layerGroup(), suivi: L.layerGroup(), survey: L.layerGroup(),
    };
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Fond de carte
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (baseTileRef.current) map.removeLayer(baseTileRef.current);
    const cfg = BASE_LAYERS[baseLayerKey];
    const tile = L.tileLayer(cfg.url, { attribution: cfg.attribution, subdomains: cfg.subdomains, maxZoom: cfg.maxZoom });
    tile.addTo(map);
    baseTileRef.current = tile;
  }, [baseLayerKey]);

  // Couche « Localités / habitats » — référentiel des 77 communes du Bénin
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.habitats;
    group.clearLayers();
    if (showHabitats) {
      Object.entries(COMMUNE_COORDS).forEach(([name, c]) => {
        L.circleMarker([c.lat, c.lon], { radius: 3, weight: 1, color: "#5A6478", fillColor: "#8891A5", fillOpacity: 0.9 })
          .bindTooltip(name, { direction: "top", offset: [0, -4] })
          .addTo(group);
      });
      group.addTo(map);
    } else if (map.hasLayer(group)) {
      map.removeLayer(group);
    }
  }, [showHabitats]);

  // Couche « Suivi agricole interne » — communes du Borgou, colorées selon l'indicateur choisi
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.suivi;
    group.clearLayers();
    if (showSuivi) {
      COMMUNES.forEach((c) => {
        const coords = COMMUNE_COORDS[c.name];
        if (!coords) return;
        const color = indicateurColor(c);
        L.circleMarker([coords.lat, coords.lon], { radius: 12, weight: 2, color: "white", fillColor: color, fillOpacity: 0.88 })
          .bindTooltip(`<b>${c.name}</b><br/>${indicateurLabel} : ${indicateurValue(c)}`, { direction: "top", offset: [0, -10] })
          .addTo(group);
      });
      group.addTo(map);
    } else if (map.hasLayer(group)) {
      map.removeLayer(group);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuivi, indicateur]);

  // Couche « Points d'enquête importés » — coordonnées réelles de la base importée, si disponibles
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.survey;
    group.clearLayers();
    if (showSurvey && hasRealGeo) {
      realPoints.forEach((pt) => {
        L.circleMarker([pt.lat, pt.lon], { radius: 4, weight: 1, color: "white", fillColor: pt.color, fillOpacity: 0.85 })
          .bindTooltip(pt.label ? String(pt.label) : "Point d'enquête", { direction: "top", offset: [0, -4] })
          .addTo(group);
      });
      group.addTo(map);
      if (realPoints.length > 0) {
        map.fitBounds(L.latLngBounds(realPoints.map((p) => [p.lat, p.lon])), { padding: [30, 30], maxZoom: 12 });
      }
    } else if (map.hasLayer(group)) {
      map.removeLayer(group);
    }
  }, [showSurvey, hasRealGeo, realPoints]);

  // Couches « Cours d'eau » et « Routes » — interrogation Overpass (OpenStreetMap) sur l'emprise
  // affichée. Chargées uniquement à partir d'un niveau de zoom suffisant pour éviter une requête
  // trop volumineuse sur l'ensemble du monde ; se recalculent lorsque la carte est déplacée/zoomée.
  const loadOverpassLayer = async (kind) => {
    const map = mapRef.current; if (!map) return;
    const setStatus = kind === "rivers" ? setRiversStatus : setRoadsStatus;
    const group = groupsRef.current[kind];
    if (map.getZoom() < 7) { setStatus("zoom"); return; }
    if (overpassAbortRef.current[kind]) overpassAbortRef.current[kind].abort();
    const controller = new AbortController();
    overpassAbortRef.current[kind] = controller;
    setStatus("loading");
    try {
      const elements = await fetchOverpassWays(kind, map.getBounds(), controller.signal);
      group.clearLayers();
      const color = kind === "rivers" ? "#3592C4" : "#8A5A00";
      elements.forEach((el) => {
        if (!el.geometry || el.geometry.length < 2) return;
        L.polyline(el.geometry.map((pt) => [pt.lat, pt.lon]), { color, weight: kind === "rivers" ? 2 : 1.5, opacity: 0.75 }).addTo(group);
      });
      setStatus("ok");
    } catch (e) {
      if (e.name !== "AbortError") setStatus("error");
    }
  };

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.rivers;
    if (showRivers) { group.addTo(map); loadOverpassLayer("rivers"); }
    else { if (map.hasLayer(group)) map.removeLayer(group); setRiversStatus(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRivers]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.roads;
    if (showRoads) { group.addTo(map); loadOverpassLayer("roads"); }
    else { if (map.hasLayer(group)) map.removeLayer(group); setRoadsStatus(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoads]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    let timer = null;
    const handler = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (showRivers) loadOverpassLayer("rivers");
        if (showRoads) loadOverpassLayer("roads");
      }, 700);
    };
    map.on("moveend", handler);
    return () => { map.off("moveend", handler); if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRivers, showRoads]);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <Watermark />
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <Sidebar active={active} onNavigate={onNavigate} />

        {/* Main */}
        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Cartographie</h1>
              <p className="text-xs text-gray-500 mt-0.5">Carte interactive — monde entier, zoom libre jusqu'à l'échelle communale du Bénin</p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8 grid grid-cols-3 gap-6">
            {/* Carte */}
            <div className="col-span-2">
              <div className="flex gap-2 mb-4 flex-wrap">
                {Object.entries(BASE_LAYERS).map(([k, cfg]) => (
                  <button key={k} onClick={() => setBaseLayerKey(k)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={baseLayerKey === k ? { background: NAVY, color: "white" } : { background: "white", color: "#5A6478", border: "1px solid #E4E6ED" }}>
                    <cfg.icon size={15} /> {cfg.label}
                  </button>
                ))}
              </div>

              <Card>
                <div ref={mapDivRef} className="rounded-xl overflow-hidden border border-gray-100" style={{ height: 520, width: "100%" }} />
                <p className="text-[10px] text-gray-400 italic mt-2">
                  Défilement à la molette ou pincement pour zoomer, cliquer-glisser pour déplacer — depuis la vue mondiale jusqu'à l'échelle communale. Fond « Satellite » : imagerie réelle utilisée comme approximation visuelle de la couverture végétale (et non une classification scientifique d'occupation du sol). Cours d'eau et routes : base collaborative OpenStreetMap (Overpass API), chargés à partir du niveau de zoom régional et actualisés au déplacement de la carte.
                </p>
              </Card>
            </div>

            {/* Filtres, couches et export */}
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Couches affichées</h2>
                </div>
                <div className="space-y-2">
                  <LayerToggle label="Localités / habitats (77 communes)" icon={Home} checked={showHabitats} onChange={() => setShowHabitats((v) => !v)} />
                  <LayerToggle label="Cours d'eau" icon={Waves} color="#3592C4" checked={showRivers} onChange={() => setShowRivers((v) => !v)} status={riversStatus} />
                  <LayerToggle label="Routes principales" icon={RouteIcon} color="#8A5A00" checked={showRoads} onChange={() => setShowRoads((v) => !v)} status={roadsStatus} />
                  <LayerToggle label="Suivi agricole interne" icon={Sprout} color="#3E9C6B" checked={showSuivi} onChange={() => setShowSuivi((v) => !v)} />
                  {hasRealGeo && (
                    <LayerToggle label={`Points d'enquête importés (${realPoints.length})`} icon={MapPin} checked={showSurvey} onChange={() => setShowSurvey((v) => !v)} />
                  )}
                </div>
                {(riversStatus === "zoom" || roadsStatus === "zoom") && (
                  <p className="text-[11px] text-gray-400 italic mt-2">Zoomez sur la zone souhaitée (échelle régionale ou plus) pour charger les cours d'eau/routes.</p>
                )}
                {(riversStatus === "error" || roadsStatus === "error") && (
                  <p className="text-[11px] mt-2" style={{ color: "#B3413A" }}>Le service cartographique communautaire (OpenStreetMap/Overpass) est temporairement indisponible — réessayez dans quelques instants.</p>
                )}
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Indicateur du suivi agricole</h2>
                </div>
                <select value={indicateur} onChange={(e) => setIndicateur(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none mb-4">
                  <option value="taux">Taux de réalisation (%)</option>
                  <option value="rendement">Rendement moyen (kg/ha)</option>
                  <option value="anomalies">Anomalies détectées</option>
                  <option value="pluvio">Pluviométrie décadaire (mm)</option>
                </select>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Filière</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(FILIERES).map(([f, c]) => (
                    <Chip key={f} label={f} active={filieres.includes(f)} onClick={() => toggleFiliere(f)} color={c} />
                  ))}
                </div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Période</label>
                <select className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }}>
                  <option>Décade 3 — Juillet 2026</option>
                  <option>Décade 2 — Juillet 2026</option>
                  <option>Décade 1 — Juillet 2026</option>
                </select>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Communes en alerte</h2>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Selon l'indicateur actuellement sélectionné</p>
                <div className="space-y-2">
                  {COMMUNES.filter((c) => c.taux < 70 || c.anomalies > 1).map((c) => (
                    <div key={c.name} className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5">
                      <span className="text-xs font-medium text-gray-700">{c.name}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FBE7E5", color: "#B3413A" }}>
                        {c.taux}% réalisé
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <FileOutput size={16} style={{ color: GOLD }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Export</h2>
                </div>
                <button className="w-full mb-2 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 bg-white border"
                  style={{ borderColor: NAVY, color: NAVY }}>
                  <Download size={14} /> Exporter la carte (PNG)
                </button>
                <button className="w-full px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
                  <Layers size={14} /> Intégrer au rapport (Résultats)
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
