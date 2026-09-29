import React, { useState, useRef, useEffect, useMemo } from "react";
import L from "leaflet";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, MapPin, Layers, Droplets, Download, FileOutput, Filter,
  Waves, Route as RouteIcon, Home, Satellite, Mountain, Map as MapIcon, Loader2, AlertCircle,
  Crosshair, Search, X, RotateCcw, Trees,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import Sidebar from "./Sidebar.jsx";
import { COMMUNE_COORDS } from "./communeCoords.js";
import { exportMapAsPNG } from "./mapExport.js";

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
// Les tuiles transitent par /api/tile-proxy (fonction serverless du projet) plutôt que par les
// domaines d'origine : ce proxy ajoute l'en-tête Access-Control-Allow-Origin absent chez ces
// fournisseurs publics, condition nécessaire pour que l'export d'image (html2canvas) puisse lire
// les pixels du canevas sans le « tacher » (SecurityError). Voir api/tile-proxy.js pour le détail
// des fournisseurs relayés et la justification complète.
const BASE_LAYERS = {
  clair: {
    label: "Fond clair", icon: MapIcon,
    url: "/api/tile-proxy?p=clair&z={z}&x={x}&y={y}",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Rendu : Wikimedia Maps',
    subdomains: "", maxZoom: 19,
  },
  osm: {
    label: "Plan (OpenStreetMap)", icon: RouteIcon,
    url: "/api/tile-proxy?p=osm&z={z}&x={x}&y={y}",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "", maxZoom: 19,
  },
  satellite: {
    label: "Satellite (couverture végétale)", icon: Satellite,
    url: "/api/tile-proxy?p=satellite&z={z}&x={x}&y={y}",
    attribution: "Tiles &copy; Esri — Source : Esri, Maxar, Earthstar Geographics",
    subdomains: "", maxZoom: 19,
  },
  relief: {
    label: "Relief", icon: Mountain,
    url: "/api/tile-proxy?p=relief&z={z}&x={x}&y={y}",
    attribution: 'Données : &copy; OpenStreetMap contributors, SRTM — Rendu : &copy; OpenTopoMap (CC-BY-SA)',
    subdomains: "", maxZoom: 17,
  },
};

// Couche superposable « Couverture du sol / végétation » — classification ESA WorldCover 2021
// (résolution 10 m, 11 classes : cultures, forêt, savane/prairie, zones bâties, plans d'eau,
// sol nu, etc.), à la différence du fond « Satellite » qui n'est qu'une image brute. Service WMS
// public de l'ESA/VITO (Terrascope), sans clé d'API. Source : https://esa-worldcover.org/
const LANDCOVER_LAYER = {
  url: "/api/tile-proxy?p=landcover&z={z}&x={x}&y={y}",
  attribution: '<a href="https://esa-worldcover.org/">ESA WorldCover 2021</a> (10 m) &copy; ESA, produit par VITO — CC BY 4.0',
  maxZoom: 18,
};

// Zoom minimal avant d'interroger Overpass : en-deçà, l'emprise visible (échelle nationale ou
// mondiale) produirait une requête portant sur une zone bien trop vaste, risquant timeout ou
// volume de données excessif côté client — d'où le seuil à 9 (échelle sous-régionale). La vue
// initiale de la carte est à zoom 7 (Bénin entier) : sans recadrage automatique, cocher « Cours
// d'eau »/« Routes » à ce niveau n'affichait donc rien tant que l'utilisateur ne zoomait pas
// manuellement — les toggles ci-dessous zooment désormais eux-mêmes la carte au seuil requis.
const MIN_OVERPASS_ZOOM = 9;

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
      {status === "empty" && <span className="text-[10px] text-gray-400 italic">aucune donnée ici</span>}
      {status === "ok" && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#3E9C6B" }} />}
    </label>
  );
}

// Interroge le proxy /api/geo-proxy (qui relaie l'API Overpass/OpenStreetMap) pour les voies
// d'eau ou les routes principales dans l'emprise actuellement affichée par la carte. Le passage
// par notre propre domaine (plutôt qu'un appel direct au navigateur vers overpass-api.de) évite
// tout blocage CORS silencieux et permet un en-tête User-Agent identifiant l'application,
// conformément à la politique d'usage équitable d'Overpass — voir api/geo-proxy.js.
async function fetchOverpassWays(kind, bounds, signal) {
  const s = bounds.getSouth().toFixed(4), w = bounds.getWest().toFixed(4);
  const n = bounds.getNorth().toFixed(4), e = bounds.getEast().toFixed(4);
  const url = `/api/geo-proxy?kind=${kind}&s=${s}&w=${w}&n=${n}&e=${e}`;
  const res = await fetch(url, { signal });
  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok || !data) {
    throw new Error((data && data.error) || `Le service a répondu avec le code ${res.status}.`);
  }
  if (data.error) throw new Error(data.error);
  return data.elements || [];
}

// Interroge les limites administratives (communes) auprès d'Overpass, pour un ou plusieurs noms
// de commune à la fois (voir api/geo-proxy.js, kind=boundary).
async function fetchCommuneBoundaries(names, signal) {
  const url = `/api/geo-proxy?kind=boundary&names=${encodeURIComponent(names.join(";"))}`;
  const res = await fetch(url, { signal });
  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok || !data) throw new Error((data && data.error) || `Le service a répondu avec le code ${res.status}.`);
  if (data.error) throw new Error(data.error);
  return data.elements || [];
}

const RING_EPS = 1e-7;
const pointsEqual = (a, b) => Math.abs(a[0] - b[0]) < RING_EPS && Math.abs(a[1] - b[1]) < RING_EPS;

// Reconstitue un ou plusieurs anneaux fermés à partir de tronçons de way disjoints (membres
// « outer » d'une relation de limite administrative OpenStreetMap) : les tronçons partagent des
// nœuds aux extrémités communes (mêmes coordonnées), qu'on assemble bout à bout jusqu'à fermeture.
// Méthode standard de reconstruction de multipolygone à partir d'arcs OSM.
function stitchRings(segments) {
  const remaining = segments.filter((s) => s && s.length >= 2).map((s) => s.slice());
  const rings = [];
  while (remaining.length) {
    let ring = remaining.shift();
    let guard = 0;
    while (guard < 500) {
      guard += 1;
      const start = ring[0], end = ring[ring.length - 1];
      if (ring.length > 2 && pointsEqual(start, end)) break;
      let foundIdx = -1, reverse = false;
      for (let i = 0; i < remaining.length; i += 1) {
        const seg = remaining[i];
        if (pointsEqual(seg[0], end)) { foundIdx = i; reverse = false; break; }
        if (pointsEqual(seg[seg.length - 1], end)) { foundIdx = i; reverse = true; break; }
      }
      if (foundIdx === -1) break;
      let seg = remaining.splice(foundIdx, 1)[0];
      if (reverse) seg = seg.slice().reverse();
      ring = ring.concat(seg.slice(1));
    }
    if (ring.length >= 3) rings.push(ring);
  }
  return rings;
}

// Choisit, parmi les relations OSM partageant le même nom (une commune et une localité/un
// arrondissement homonymes existent souvent en même temps), celle qui correspond le mieux à la
// commune administrative : on préfère les niveaux admin_level habituellement utilisés pour les
// communes en Afrique de l'Ouest sur OpenStreetMap (4 ou 6), puis, à égalité, la géométrie
// couvrant la plus grande superficie (la commune englobe ses localités).
function pickBestBoundaryRelation(relations) {
  if (relations.length <= 1) return relations[0] || null;
  const score = (rel) => {
    const level = Number(rel.tags && rel.tags.admin_level);
    const levelScore = level === 4 || level === 6 ? 2 : level === 3 || level === 5 ? 1 : 0;
    const memberCount = (rel.members || []).length;
    return levelScore * 1000 + memberCount;
  };
  return relations.slice().sort((a, b) => score(b) - score(a))[0];
}

function relationToRings(rel) {
  const outerSegments = (rel.members || [])
    .filter((m) => m.type === "way" && m.role !== "inner" && m.geometry && m.geometry.length >= 2)
    .map((m) => m.geometry.map((pt) => [pt.lat, pt.lon]));
  return stitchRings(outerSegments);
}

export default function Cartographie({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin, dataset }) {
  const [baseLayerKey, setBaseLayerKey] = useState("osm");
  const [showRivers, setShowRivers] = useState(false);
  const [showRoads, setShowRoads] = useState(false);
  const [showHabitats, setShowHabitats] = useState(true);
  const [showLandcover, setShowLandcover] = useState(false);
  const [showSuivi, setShowSuivi] = useState(true);
  const [showSurvey, setShowSurvey] = useState(true);
  const [indicateur, setIndicateur] = useState("taux");
  const [filieres, setFilieres] = useState(Object.keys(FILIERES));
  const [riversStatus, setRiversStatus] = useState(null);
  const [roadsStatus, setRoadsStatus] = useState(null);

  // ---------- Extraction cartographique par commune / groupe de communes ----------
  const [extractionMode, setExtractionMode] = useState("single"); // "single" | "group"
  const [extractionSelection, setExtractionSelection] = useState([]);
  const [extractionActive, setExtractionActive] = useState(false);
  const [extractionSearch, setExtractionSearch] = useState("");
  const [exportError, setExportError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const borgouNames = COMMUNES.map((c) => c.name);
  const otherCommuneNames = Object.keys(COMMUNE_COORDS)
    .filter((n) => !borgouNames.includes(n))
    .sort((a, b) => a.localeCompare(b, "fr"));
  const filteredOtherCommunes = extractionSearch
    ? otherCommuneNames.filter((n) => n.toLowerCase().includes(extractionSearch.toLowerCase()))
    : otherCommuneNames;

  const toggleExtractionCommune = (name) => {
    setExtractionSelection((prev) => {
      if (extractionMode === "single") return prev.includes(name) ? [] : [name];
      return prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name];
    });
  };

  const applyExtraction = () => {
    if (extractionSelection.length === 0) return;
    setExtractionActive(true);
    setExportError(null);
  };

  const resetExtraction = () => {
    setExtractionActive(false);
    setExtractionSelection([]);
    setExportError(null);
    const map = mapRef.current;
    if (map) map.setView([9.5, 2.3], 7);
  };

  const exportTitle = extractionActive && extractionSelection.length > 0
    ? (extractionSelection.length === 1 ? `Commune de ${extractionSelection[0]}` : `Groupe de communes : ${extractionSelection.join(", ")}`)
    : "Département du Borgou — vue d'ensemble";

  const handleExportMap = async () => {
    setExporting(true);
    setExportError(null);
    const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const slug = extractionActive && extractionSelection.length > 0
      ? extractionSelection.join("_")
      : "Borgou_vue_ensemble";
    const result = await exportMapAsPNG(mapExportRef.current, `AgriHakStat_carte_${slug}_${dateStr.replace(/\s+/g, "-")}`);
    if (!result.ok) setExportError(result.error);
    setExporting(false);
  };

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
  const mapExportRef = useRef(null);
  const mapRef = useRef(null);
  const baseTileRef = useRef(null);
  const landcoverTileRef = useRef(null);
  const groupsRef = useRef({});
  const overpassAbortRef = useRef({ rivers: null, roads: null, boundary: null });
  const [boundaryStatus, setBoundaryStatus] = useState(null); // null | loading | ok | partial | error
  const [boundaryMissing, setBoundaryMissing] = useState([]);

  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return;
    const map = L.map(mapDivRef.current, { center: [9.5, 2.3], zoom: 7, minZoom: 2, maxZoom: 19, worldCopyJump: true });
    mapRef.current = map;
    groupsRef.current = {
      rivers: L.layerGroup(), roads: L.layerGroup(), boundaries: L.layerGroup(),
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
    const tile = L.tileLayer(cfg.url, { attribution: cfg.attribution, subdomains: cfg.subdomains, maxZoom: cfg.maxZoom, crossOrigin: true });
    tile.addTo(map);
    baseTileRef.current = tile;
    // La couche « Couverture du sol » partage le même panneau (tilePane) que le fond de carte ;
    // comme ce dernier vient d'être réinséré, il faut la ramener au premier plan pour qu'un
    // changement de fond ne la fasse pas disparaître sous le nouveau fond.
    if (landcoverTileRef.current) landcoverTileRef.current.bringToFront();
  }, [baseLayerKey]);

  // Couche « Couverture du sol / végétation » (ESA WorldCover, superposée semi-transparente)
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (showLandcover) {
      if (!landcoverTileRef.current) {
        landcoverTileRef.current = L.tileLayer(LANDCOVER_LAYER.url, {
          attribution: LANDCOVER_LAYER.attribution, maxZoom: LANDCOVER_LAYER.maxZoom, opacity: 0.65, crossOrigin: true,
        });
      }
      landcoverTileRef.current.addTo(map);
      landcoverTileRef.current.bringToFront();
    } else if (landcoverTileRef.current && map.hasLayer(landcoverTileRef.current)) {
      map.removeLayer(landcoverTileRef.current);
    }
  }, [showLandcover]);

  // Couche « Localités / habitats » — référentiel des 77 communes du Bénin
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.habitats;
    group.clearLayers();
    if (showHabitats) {
      const entries = extractionActive && extractionSelection.length > 0
        ? Object.entries(COMMUNE_COORDS).filter(([name]) => extractionSelection.includes(name))
        : Object.entries(COMMUNE_COORDS);
      entries.forEach(([name, c]) => {
        L.circleMarker([c.lat, c.lon], { radius: 3, weight: 1, color: "#5A6478", fillColor: "#8891A5", fillOpacity: 0.9 })
          .bindTooltip(name, { direction: "top", offset: [0, -4] })
          .addTo(group);
      });
      group.addTo(map);
    } else if (map.hasLayer(group)) {
      map.removeLayer(group);
    }
  }, [showHabitats, extractionActive, extractionSelection]);

  // Couche « Suivi agricole interne » — communes du Borgou, colorées selon l'indicateur choisi
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.suivi;
    group.clearLayers();
    if (showSuivi) {
      const list = extractionActive && extractionSelection.length > 0
        ? COMMUNES.filter((c) => extractionSelection.includes(c.name))
        : COMMUNES;
      list.forEach((c) => {
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
  }, [showSuivi, indicateur, extractionActive, extractionSelection]);

  // Recadrage immédiat de la carte lors de l'activation/mise à jour d'une extraction, sur la
  // seule base du point de la (des) commune(s) — vue provisoire affichée sans attendre le réseau ;
  // affinée dès que la géométrie exacte de la limite administrative est connue (effet suivant).
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (!extractionActive || extractionSelection.length === 0) return;
    const coords = extractionSelection.map((n) => COMMUNE_COORDS[n]).filter(Boolean);
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView([coords[0].lat, coords[0].lon], 11);
    } else {
      map.fitBounds(L.latLngBounds(coords.map((c) => [c.lat, c.lon])), { padding: [50, 50], maxZoom: 12 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractionActive, extractionSelection]);

  // Couche « Limite administrative » — délimitation réelle (polygone) de la ou des communes
  // isolées par extraction, tracée à partir des limites OpenStreetMap (voir fetchCommuneBoundaries
  // / stitchRings ci-dessus). Sans cette couche, la sélection n'était matérialisée que par un point
  // coloré, sans indication claire de l'étendue réelle de la commune. À défaut de limite trouvée
  // dans OpenStreetMap pour une commune donnée, un cercle pointillé approximatif (rayon 9 km,
  // convention purement indicative) prend le relais et l'utilisateur en est informé explicitement.
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.boundaries;
    group.clearLayers();
    if (!extractionActive || extractionSelection.length === 0) {
      setBoundaryStatus(null);
      setBoundaryMissing([]);
      if (map.hasLayer(group)) map.removeLayer(group);
      return;
    }
    group.addTo(map);
    if (overpassAbortRef.current.boundary) overpassAbortRef.current.boundary.abort();
    const controller = new AbortController();
    overpassAbortRef.current.boundary = controller;
    setBoundaryStatus("loading");
    const selection = extractionSelection;

    (async () => {
      try {
        const relations = await fetchCommuneBoundaries(selection, controller.signal);
        group.clearLayers();
        const byName = {};
        relations.forEach((rel) => {
          const nm = rel.tags && rel.tags.name;
          if (!nm || !selection.includes(nm)) return;
          (byName[nm] = byName[nm] || []).push(rel);
        });
        const missing = [];
        let allLatLngs = [];
        selection.forEach((name) => {
          const best = pickBestBoundaryRelation(byName[name] || []);
          const rings = best ? relationToRings(best) : [];
          if (rings.length > 0) {
            L.polygon(rings, { color: NAVY, weight: 2.5, fillColor: NAVY, fillOpacity: 0.08 })
              .bindTooltip(`Limite administrative — ${name}`, { sticky: true })
              .addTo(group);
            rings.forEach((r) => { allLatLngs = allLatLngs.concat(r); });
          } else {
            missing.push(name);
            const coords = COMMUNE_COORDS[name];
            if (coords) {
              L.circle([coords.lat, coords.lon], { radius: 9000, color: "#8A93A8", weight: 2, dashArray: "6 5", fillColor: "#8A93A8", fillOpacity: 0.06 })
                .bindTooltip(`${name} — limite précise indisponible dans OpenStreetMap (cercle indicatif, rayon 9 km)`, { sticky: true })
                .addTo(group);
              allLatLngs.push([coords.lat + 0.08, coords.lon], [coords.lat - 0.08, coords.lon], [coords.lat, coords.lon + 0.08], [coords.lat, coords.lon - 0.08]);
            }
          }
        });
        group.eachLayer((l) => l.bringToBack());
        setBoundaryMissing(missing);
        setBoundaryStatus(missing.length === 0 ? "ok" : missing.length === selection.length ? "error" : "partial");
        if (allLatLngs.length > 0) {
          map.fitBounds(L.latLngBounds(allLatLngs), { padding: [50, 50], maxZoom: selection.length === 1 ? 13 : 12 });
        }
      } catch (err) {
        if (err.name !== "AbortError") setBoundaryStatus("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractionActive, extractionSelection]);

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
    if (map.getZoom() < MIN_OVERPASS_ZOOM) { setStatus("zoom"); return; }
    if (overpassAbortRef.current[kind]) overpassAbortRef.current[kind].abort();
    const controller = new AbortController();
    overpassAbortRef.current[kind] = controller;
    setStatus("loading");
    try {
      const elements = await fetchOverpassWays(kind, map.getBounds(), controller.signal);
      group.clearLayers();
      const color = kind === "rivers" ? "#3592C4" : "#8A5A00";
      let drawn = 0;
      elements.forEach((el) => {
        if (!el.geometry || el.geometry.length < 2) return;
        L.polyline(el.geometry.map((pt) => [pt.lat, pt.lon]), { color, weight: kind === "rivers" ? 2 : 1.5, opacity: 0.75 }).addTo(group);
        drawn += 1;
      });
      setStatus(drawn === 0 ? "empty" : "ok");
    } catch (e) {
      if (e.name !== "AbortError") setStatus("error");
    }
  };

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.rivers;
    if (showRivers) {
      group.addTo(map);
      // Recadrage automatique si la vue actuelle est trop large pour interroger Overpass, afin
      // que cocher la couche produise un effet visible immédiat plutôt qu'une simple invite à zoomer.
      if (map.getZoom() < MIN_OVERPASS_ZOOM) map.setZoom(MIN_OVERPASS_ZOOM);
      loadOverpassLayer("rivers");
    } else { if (map.hasLayer(group)) map.removeLayer(group); setRiversStatus(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRivers]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const group = groupsRef.current.roads;
    if (showRoads) {
      group.addTo(map);
      if (map.getZoom() < MIN_OVERPASS_ZOOM) map.setZoom(MIN_OVERPASS_ZOOM);
      loadOverpassLayer("roads");
    } else { if (map.hasLayer(group)) map.removeLayer(group); setRoadsStatus(null); }
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

              {extractionActive && extractionSelection.length > 0 && (
                <div className="mb-3 rounded-xl" style={{ background: "#EBEEF7", border: `1px solid ${NAVY}` }}>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: NAVY }}>
                      <Crosshair size={15} />
                      Extraction active — {exportTitle}
                    </div>
                    <button onClick={resetExtraction} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-white/60" style={{ color: NAVY }}>
                      <RotateCcw size={12} /> Revenir à la vue d'ensemble
                    </button>
                  </div>
                  <div className="px-4 pb-2.5 -mt-1 text-[11px] flex items-center gap-1.5" style={{ color: "#5A6478" }}>
                    {boundaryStatus === "loading" && (<><Loader2 size={11} className="animate-spin" /> Chargement de la limite administrative (OpenStreetMap)…</>)}
                    {boundaryStatus === "ok" && (<><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#3E9C6B" }} /> Limite(s) administrative(s) précise(s) affichée(s).</>)}
                    {boundaryStatus === "partial" && (<><AlertCircle size={11} className="text-amber-500" /> Limite approximative (cercle, 9 km) pour : {boundaryMissing.join(", ")} — non recensée(s) dans OpenStreetMap.</>)}
                    {boundaryStatus === "error" && (<><AlertCircle size={11} className="text-red-400" /> Limite précise indisponible — cercle approximatif (9 km) affiché à titre indicatif.</>)}
                  </div>
                </div>
              )}

              <Card>
                {/* Cartouche capturé avec la carte lors de l'export image : titre, date, source */}
                <div ref={mapExportRef} className="bg-white">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div>
                      <p className="font-serif font-semibold text-sm" style={{ color: NAVY }}>{exportTitle}</p>
                      <p className="text-[10px] text-gray-400">
                        AgriHakStat — DDAEP-Borgou · {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                        {showSuivi && ` · Indicateur : ${indicateurLabel}`}
                      </p>
                    </div>
                    {showSuivi && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#3E9C6B" }} />Satisfaisant</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#E3A23B" }} />Modéré</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#C1573F" }} />Critique</span>
                      </div>
                    )}
                  </div>
                  <div ref={mapDivRef} className="rounded-xl overflow-hidden border border-gray-100" style={{ height: 520, width: "100%" }} />
                </div>
                <p className="text-[10px] text-gray-400 italic mt-2">
                  Défilement à la molette ou pincement pour zoomer, cliquer-glisser pour déplacer — depuis la vue mondiale jusqu'à l'échelle communale. Fond « Satellite » : imagerie réelle utilisée comme approximation visuelle (et non une classification scientifique d'occupation du sol) ; pour une classification effective, activer la couche « Couverture du sol (végétation) » — ESA WorldCover 2021, 10 m de résolution. Cours d'eau et routes : base collaborative OpenStreetMap (Overpass API), chargés à partir de l'échelle sous-régionale/communale et actualisés au déplacement de la carte.
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
                  <LayerToggle label="Couverture du sol (végétation)" icon={Trees} color="#3E9C6B" checked={showLandcover} onChange={() => setShowLandcover((v) => !v)} />
                  <LayerToggle label="Suivi agricole interne" icon={Sprout} color="#3E9C6B" checked={showSuivi} onChange={() => setShowSuivi((v) => !v)} />
                  {hasRealGeo && (
                    <LayerToggle label={`Points d'enquête importés (${realPoints.length})`} icon={MapPin} checked={showSurvey} onChange={() => setShowSurvey((v) => !v)} />
                  )}
                </div>
                {(riversStatus === "zoom" || roadsStatus === "zoom") && (
                  <p className="text-[11px] text-gray-400 italic mt-2">Zoomez sur la zone souhaitée (échelle sous-régionale ou communale) pour charger les cours d'eau/routes.</p>
                )}
                {(riversStatus === "empty" || roadsStatus === "empty") && (
                  <p className="text-[11px] text-gray-400 italic mt-2">Aucun tronçon référencé par OpenStreetMap dans cette emprise — déplacez ou dézoomez légèrement la carte.</p>
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
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair size={16} style={{ color: NAVY }} />
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Extraction cartographique</h2>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Isoler une commune ou un groupe de communes sur la carte, pour analyse ou export dédié.</p>

                <div className="flex rounded-xl border border-gray-200 p-1 mb-3">
                  <button onClick={() => { setExtractionMode("single"); setExtractionSelection((s) => s.slice(0, 1)); }}
                    className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors"
                    style={extractionMode === "single" ? { background: NAVY, color: "white" } : { color: "#5A6478" }}>
                    Une commune
                  </button>
                  <button onClick={() => setExtractionMode("group")}
                    className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors"
                    style={extractionMode === "group" ? { background: NAVY, color: "white" } : { color: "#5A6478" }}>
                    Groupe de communes
                  </button>
                </div>

                <div className="relative mb-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="text" value={extractionSearch} onChange={(e) => setExtractionSearch(e.target.value)}
                    placeholder="Rechercher une commune…"
                    className="w-full text-xs rounded-lg border border-gray-200 pl-7 pr-2 py-1.5 focus:outline-none" />
                </div>

                <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50 mb-3">
                  {(!extractionSearch || "borgou".includes(extractionSearch.toLowerCase()) || borgouNames.some((n) => n.toLowerCase().includes(extractionSearch.toLowerCase()))) && (
                    <>
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50">Borgou — suivi agro-climatique</div>
                      {borgouNames
                        .filter((n) => !extractionSearch || n.toLowerCase().includes(extractionSearch.toLowerCase()))
                        .map((n) => (
                          <label key={n} className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                            <input type={extractionMode === "single" ? "radio" : "checkbox"} checked={extractionSelection.includes(n)}
                              onChange={() => toggleExtractionCommune(n)} className="w-3.5 h-3.5" style={{ accentColor: NAVY }} />
                            {n}
                          </label>
                        ))}
                    </>
                  )}
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50">Autres communes du Bénin</div>
                  {filteredOtherCommunes.slice(0, 200).map((n) => (
                    <label key={n} className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                      <input type={extractionMode === "single" ? "radio" : "checkbox"} checked={extractionSelection.includes(n)}
                        onChange={() => toggleExtractionCommune(n)} className="w-3.5 h-3.5" style={{ accentColor: NAVY }} />
                      {n}
                    </label>
                  ))}
                </div>

                {extractionSelection.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {extractionSelection.map((n) => (
                      <span key={n} className="flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full" style={{ background: "#EBEEF7", color: NAVY }}>
                        {n}
                        <button onClick={() => toggleExtractionCommune(n)}><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={applyExtraction} disabled={extractionSelection.length === 0}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: NAVY }}>
                    <Crosshair size={13} /> Isoler sur la carte
                  </button>
                  {extractionActive && (
                    <button onClick={resetExtraction} className="px-3 py-2 rounded-xl text-xs font-medium border" style={{ borderColor: "#D8DEE9", color: "#5A6478" }}>
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
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
                <button onClick={handleExportMap} disabled={exporting}
                  className="w-full mb-2 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 bg-white border disabled:opacity-50"
                  style={{ borderColor: NAVY, color: NAVY }}>
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {exporting ? "Génération de l'image…" : `Exporter ${extractionActive && extractionSelection.length > 0 ? "cette vue" : "la carte"} (PNG)`}
                </button>
                {exportError && (
                  <p className="text-[11px] mb-2" style={{ color: "#B3413A" }}>{exportError}</p>
                )}
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
