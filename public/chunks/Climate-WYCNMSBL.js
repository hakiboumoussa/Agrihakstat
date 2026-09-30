import {
  BENIN_DEPARTEMENTS,
  utils,
  writeFileSync
} from "./chunk-YSBAVJAT.js";
import {
  ChartExportButton
} from "./chunk-JQ22GYUN.js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "./chunk-CBURJCWO.js";
import "./chunk-UAGJ44GB.js";
import {
  COMMUNE_COORDS
} from "./chunk-IZBMDELT.js";
import {
  Sidebar,
  UserMenu
} from "./chunk-FYJTF33N.js";
import {
  Bell,
  CircleAlert,
  CloudRain,
  Download,
  Droplets,
  Info,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Sprout,
  Sun,
  Thermometer,
  TriangleAlert,
  WavesHorizontal,
  X,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// src/Climate.jsx
var import_react = __toESM(require_react());

// src/agroClimate.js
var RAIN_DAY_THRESHOLD_MM = 5;
var SOIL_TEXTURE_TABLE = {
  sableux: { label: "Sableux", awcMm: 21 },
  sablo_limoneux: { label: "Sablo-limoneux", awcMm: 71 },
  limono_sableux: { label: "Limono-sableux (d\xE9faut Borgou)", awcMm: 121 },
  limoneux: { label: "Limoneux", awcMm: 167 },
  limono_argileux: { label: "Limono-argileux", awcMm: 200 },
  argileux: { label: "Argileux", awcMm: 150 }
};
var DEFAULT_SOIL_TEXTURE = "limono_sableux";
var CROP_KC_TABLE = {
  mais: {
    label: "Ma\xEFs (cycle moyen)",
    duree: { ini: 20, dev: 35, mid: 40, fin: 15 },
    kc: { ini: 0.3, mid: 1.2, fin: 0.6 },
    zrMax: 1.3,
    pBase: 0.55
    // FAO-56 Tableau 22 : « Maize, Field (grain) », Zr 1,0–1,7 m, p = 0,55
  },
  sorgho: {
    label: "Sorgho",
    duree: { ini: 20, dev: 30, mid: 40, fin: 30 },
    kc: { ini: 0.3, mid: 1.05, fin: 0.55 },
    zrMax: 1.5,
    pBase: 0.55
    // FAO-56 Tableau 22 : « Sorghum - grain », Zr 1,0–2,0 m, p = 0,55
  },
  riz_pluvial: {
    label: "Riz pluvial (non irrigu\xE9)",
    duree: { ini: 30, dev: 30, mid: 30, fin: 30 },
    kc: { ini: 1.05, mid: 1.2, fin: 0.75 },
    // FAO-56 Tableau 22 donne Zr 0,5–1,0 m pour le riz, mais p = 0,20 y est explicitement défini
    // « of saturation » pour le riz inondé (submergé en permanence) — non pertinent ici puisqu'il
    // s'agit de riz PLUVIAL non irrigué, cultivé à même le régime de pluie sans lame d'eau
    // maintenue. On retient donc une fraction de tarissement usuelle de céréale pluviale (p = 0,50)
    // plutôt que la valeur « riz irrigué » du tableau, qui sous-estimerait fortement le stress.
    zrMax: 0.75,
    pBase: 0.5
  },
  niebe: {
    label: "Ni\xE9b\xE9 (cycle court)",
    duree: { ini: 15, dev: 20, mid: 30, fin: 20 },
    kc: { ini: 0.4, mid: 1.05, fin: 0.55 },
    zrMax: 0.75,
    pBase: 0.45
    // FAO-56 Tableau 22 : « Beans, dry and Pulses », Zr 0,6–0,9 m, p = 0,45
  },
  soja: {
    label: "Soja",
    duree: { ini: 20, dev: 30, mid: 45, fin: 25 },
    kc: { ini: 0.4, mid: 1.15, fin: 0.5 },
    zrMax: 0.95,
    pBase: 0.5
    // FAO-56 Tableau 22 : « Soybeans », Zr 0,6–1,3 m, p = 0,50
  },
  coton: {
    label: "Coton",
    duree: { ini: 30, dev: 50, mid: 60, fin: 30 },
    kc: { ini: 0.35, mid: 1.18, fin: 0.65 },
    zrMax: 1.35,
    pBase: 0.65
    // FAO-56 Tableau 22 : « Cotton », Zr 1,0–1,7 m, p = 0,65
  },
  arachide: {
    label: "Arachide",
    duree: { ini: 25, dev: 35, mid: 45, fin: 25 },
    kc: { ini: 0.4, mid: 1.08, fin: 0.55 },
    zrMax: 0.75,
    pBase: 0.5
    // FAO-56 Tableau 22 : « Groundnut (Peanut) », Zr 0,5–1,0 m, p = 0,50
  },
  manioc: {
    label: "Manioc (cycle long, valeurs indicatives)",
    duree: { ini: 60, dev: 60, mid: 120, fin: 60 },
    kc: { ini: 0.3, mid: 0.9, fin: 0.5 },
    // Le manioc n'est pas répertorié au Tableau 22 de la FAO-56. Zr et p sont estimés à partir de
    // la littérature agronomique sur l'enracinement du manioc (système racinaire principalement
    // concentré entre 0,3 et 1,0 m, plante réputée relativement tolérante au déficit hydrique) —
    // valeurs à recaler par calibration locale si possible.
    zrMax: 0.8,
    pBase: 0.55
  }
};
function kcForDay(crop, dayIndex) {
  const { duree, kc } = crop;
  const tIni = duree.ini;
  const tDev = tIni + duree.dev;
  const tMid = tDev + duree.mid;
  const tFin = tMid + duree.fin;
  if (dayIndex < 0) return null;
  if (dayIndex <= tIni) return kc.ini;
  if (dayIndex <= tDev) {
    const frac = (dayIndex - tIni) / duree.dev;
    return kc.ini + frac * (kc.mid - kc.ini);
  }
  if (dayIndex <= tMid) return kc.mid;
  if (dayIndex <= tFin) {
    const frac = (dayIndex - tMid) / duree.fin;
    return kc.mid + frac * (kc.fin - kc.mid);
  }
  return null;
}
function stageForDay(crop, dayIndex) {
  const { duree } = crop;
  const tIni = duree.ini;
  const tDev = tIni + duree.dev;
  const tMid = tDev + duree.mid;
  const tFin = tMid + duree.fin;
  if (dayIndex < 0 || dayIndex > tFin) return null;
  if (dayIndex <= tIni) return "Initiale";
  if (dayIndex <= tDev) return "D\xE9veloppement";
  if (dayIndex <= tMid) return "Mi-saison";
  return "Fin de cycle";
}
function cropCycleLength(crop) {
  return crop.duree.ini + crop.duree.dev + crop.duree.mid + crop.duree.fin;
}
function rootDepthForDay(crop, dayIndex) {
  const { duree, zrMax } = crop;
  const zrMin = Math.min(0.15, zrMax * 0.25);
  const tIni = duree.ini;
  const tDev = tIni + duree.dev;
  if (dayIndex <= tIni) return zrMin;
  if (dayIndex <= tDev) {
    const frac = (dayIndex - tIni) / duree.dev;
    return zrMin + frac * (zrMax - zrMin);
  }
  return zrMax;
}
function computeWaterBalance(daily) {
  let cumulNonBorne = 0;
  let cumulBorne = 0;
  return daily.map((d) => {
    const bilanJour = (d.pluie ?? 0) - (d.et0 ?? 0);
    cumulNonBorne += bilanJour;
    cumulBorne = Math.max(0, cumulBorne + bilanJour);
    return { ...d, bilanJour, bilanCumule: cumulNonBorne, reserveEstimee: cumulBorne };
  });
}
function computeCropWaterSatisfaction(daily, cropKey, sowingDateISO, textureKey = DEFAULT_SOIL_TEXTURE) {
  const crop = CROP_KC_TABLE[cropKey];
  const texture = SOIL_TEXTURE_TABLE[textureKey] || SOIL_TEXTURE_TABLE[DEFAULT_SOIL_TEXTURE];
  if (!crop || !sowingDateISO) return null;
  const sowing = new Date(sowingDateISO);
  const cycleLength = cropCycleLength(crop);
  const byDate = new Map(daily.map((d) => [d.dateISO, d]));
  const decades = [];
  let current = null;
  let drPrev = 0;
  for (let dayIndex = 0; dayIndex <= cycleLength; dayIndex++) {
    const date = new Date(sowing);
    date.setDate(date.getDate() + dayIndex);
    const dateISO = date.toISOString().slice(0, 10);
    const kc = kcForDay(crop, dayIndex);
    if (kc === null) continue;
    const stage = stageForDay(crop, dayIndex);
    const d = byDate.get(dateISO);
    const et0 = d?.et0 ?? null;
    const pluie = d?.pluie ?? null;
    const etc = et0 !== null ? kc * et0 : null;
    const zr = rootDepthForDay(crop, dayIndex);
    const taw = texture.awcMm * zr;
    const pAdj = etc !== null ? Math.min(0.8, Math.max(0.1, crop.pBase + 0.04 * (5 - etc))) : crop.pBase;
    const raw = pAdj * taw;
    const ks = drPrev <= raw ? 1 : Math.max(0, (taw - drPrev) / Math.max(1e-6, taw - raw));
    const etcAdj = etc !== null ? ks * etc : null;
    let dr = drPrev - (pluie ?? 0) + (etcAdj ?? 0);
    dr = Math.min(taw, Math.max(0, dr));
    const eauDisponible = taw - dr;
    drPrev = dr;
    const decadeIndex = Math.floor(dayIndex / 10);
    if (!current || current.decadeIndex !== decadeIndex) {
      current = {
        decadeIndex,
        stage,
        dateDebut: dateISO,
        dateFin: dateISO,
        pluieCumul: 0,
        etcCumul: 0,
        joursManquants: 0,
        nJours: 0,
        ksSum: 0,
        taw: 0,
        raw: 0,
        eauDisponible: 0,
        dr: 0
      };
      decades.push(current);
    }
    current.dateFin = dateISO;
    current.nJours += 1;
    current.ksSum += ks;
    current.taw = taw;
    current.raw = raw;
    current.eauDisponible = eauDisponible;
    current.dr = dr;
    if (pluie !== null) current.pluieCumul += pluie;
    if (etc !== null) current.etcCumul += etc;
    else current.joursManquants += 1;
  }
  const decadesResult = decades.filter((dec) => dec.etcCumul > 0 || dec.pluieCumul > 0).map((dec) => {
    const ise = dec.etcCumul > 0 ? dec.pluieCumul / dec.etcCumul : null;
    const ksMoyen = dec.nJours > 0 ? dec.ksSum / dec.nJours : null;
    let statut = "Donn\xE9es insuffisantes";
    if (ksMoyen !== null && dec.joursManquants < dec.nJours) {
      if (ksMoyen >= 0.9) statut = "Besoins satisfaits";
      else if (ksMoyen >= 0.5) statut = "Stress mod\xE9r\xE9";
      else statut = "Stress s\xE9v\xE8re";
    }
    return { ...dec, ise, ksMoyen, statut };
  });
  const totalEtc = decadesResult.reduce((s, d) => s + (d.etcCumul || 0), 0);
  const totalPluie = decadesResult.reduce((s, d) => s + (d.pluieCumul || 0), 0);
  const dateFinCycle = new Date(sowing);
  dateFinCycle.setDate(dateFinCycle.getDate() + cycleLength);
  const derniereDecade = decadesResult[decadesResult.length - 1] || null;
  return {
    crop: crop.label,
    cycleLength,
    sowingDateISO,
    dateFinCycleISO: dateFinCycle.toISOString().slice(0, 10),
    texture: texture.label,
    decades: decadesResult,
    totalEtc,
    totalPluie,
    iseGlobal: totalEtc > 0 ? totalPluie / totalEtc : null,
    // Statut hydrique courant de la zone racinaire, à la dernière décade calculée
    eauDisponibleActuelle: derniereDecade?.eauDisponible ?? null,
    tawActuelle: derniereDecade?.taw ?? null,
    ksActuel: derniereDecade?.ksMoyen ?? null,
    periodesStress: decadesResult.filter((d) => d.statut === "Stress mod\xE9r\xE9" || d.statut === "Stress s\xE9v\xE8re")
  };
}
function detectDrySpells(daily, threshold = RAIN_DAY_THRESHOLD_MM, minLength = 7) {
  const spells = [];
  let run = null;
  daily.forEach((d, i) => {
    const isDry = d.pluie !== null && d.pluie !== void 0 && d.pluie <= threshold;
    if (isDry) {
      if (!run) run = { startIndex: i, start: d.date, startISO: d.dateISO, length: 0 };
      run.length += 1;
      run.end = d.date;
      run.endISO = d.dateISO;
    } else if (run) {
      spells.push(run);
      run = null;
    }
  });
  if (run) spells.push(run);
  const significant = spells.filter((s) => s.length >= minLength).sort((a, b) => b.length - a.length);
  return {
    all: spells,
    significant,
    longest: spells.reduce((max, s) => s.length > (max?.length || 0) ? s : max, null),
    countSignificant: significant.length
  };
}
function aggregateByPeriod(daily, period) {
  const groups = /* @__PURE__ */ new Map();
  daily.forEach((d) => {
    if (!d.dateISO) return;
    const dt = new Date(d.dateISO);
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const key = period === "mois" ? `${year}-${String(month + 1).padStart(2, "0")}` : `${year}-T${Math.floor(month / 3) + 1}`;
    if (!groups.has(key)) {
      groups.set(key, { key, pluie: 0, et0: 0, tmaxSum: 0, tminSum: 0, n: 0, joursPluie: 0 });
    }
    const g = groups.get(key);
    if (d.pluie !== null && d.pluie !== void 0) {
      g.pluie += d.pluie;
      if (d.pluie > RAIN_DAY_THRESHOLD_MM) g.joursPluie += 1;
    }
    if (d.et0 !== null && d.et0 !== void 0) g.et0 += d.et0;
    if (d.tmax !== null && d.tmax !== void 0) g.tmaxSum += d.tmax;
    if (d.tmin !== null && d.tmin !== void 0) g.tminSum += d.tmin;
    g.n += 1;
  });
  return [...groups.values()].sort((a, b) => a.key > b.key ? 1 : -1).map((g) => ({
    periode: g.key,
    pluie: g.pluie,
    et0: g.et0,
    tmoyenne: g.n > 0 ? (g.tmaxSum + g.tminSum) / (2 * g.n) : null,
    joursPluie: g.joursPluie,
    n: g.n
  }));
}

// src/Climate.jsx
var NAVY = "#1F3864";
var GOLD = "#C99A2E";
var GREEN = "#256B45";
var GREEN_TINT = "#E4F5EC";
var AMBER = "#8A5A00";
var AMBER_TINT = "#FDF1DA";
var RED = "#B3413A";
var RED_TINT = "#FBE7E5";
var NAVY_TINT = "#EBEEF7";
function Card({ children, className = "" }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}` }, children);
}
function Chip({ label, active, onClick, color }) {
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick,
      className: "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
      style: active ? { background: color || NAVY, borderColor: color || NAVY, color: "white" } : { background: "white", borderColor: "#D8DEE9", color: "#5A6478" }
    },
    label
  );
}
function averageDailyAcrossCommunes(perCommuneDaily) {
  const byDate = /* @__PURE__ */ new Map();
  perCommuneDaily.forEach((daily) => {
    daily.forEach((d) => {
      if (!byDate.has(d.dateISO)) byDate.set(d.dateISO, { dateISO: d.dateISO, date: d.date, pluie: [], tmax: [], tmin: [], et0: [] });
      const g = byDate.get(d.dateISO);
      if (d.pluie !== null && d.pluie !== void 0) g.pluie.push(d.pluie);
      if (d.tmax !== null && d.tmax !== void 0) g.tmax.push(d.tmax);
      if (d.tmin !== null && d.tmin !== void 0) g.tmin.push(d.tmin);
      if (d.et0 !== null && d.et0 !== void 0) g.et0.push(d.et0);
    });
  });
  const avg = (arr) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
  return [...byDate.values()].sort((a, b) => a.dateISO > b.dateISO ? 1 : -1).map((g) => ({
    dateISO: g.dateISO,
    date: g.date,
    pluie: avg(g.pluie),
    tmax: avg(g.tmax),
    tmin: avg(g.tmin),
    et0: avg(g.et0)
  }));
}
function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}
function defaultDates() {
  const end = /* @__PURE__ */ new Date();
  end.setDate(end.getDate() - 5);
  const start = new Date(end);
  start.setDate(start.getDate() - 89);
  return { start: toYYYYMMDD(start), end: toYYYYMMDD(end) };
}
function StatusPill({ statut }) {
  const map = {
    "Besoins satisfaits": { bg: GREEN_TINT, color: GREEN },
    "Stress mod\xE9r\xE9": { bg: AMBER_TINT, color: AMBER },
    "Stress s\xE9v\xE8re": { bg: RED_TINT, color: RED },
    "Donn\xE9es insuffisantes": { bg: "#F1F2F6", color: "#8891A5" }
  };
  const s = map[statut] || map["Donn\xE9es insuffisantes"];
  return /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full", style: { background: s.bg, color: s.color } }, statut);
}
function zoneDescription(communes, departements) {
  const nC = communes.length;
  const communesTxt = communes.length <= 3 ? communes.join(", ") : `${communes.slice(0, 3).join(", ")} et ${communes.length - 3} autre(s)`;
  return `la zone couvrant ${nC} commune${nC > 1 ? "s" : ""} (${communesTxt}) du/des d\xE9partement${departements.length > 1 ? "s" : ""} ${departements.join(", ")}`;
}
function AnalysisNote({ children }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-3 rounded-xl p-3 flex items-start gap-2.5", style: { background: NAVY_TINT } }, /* @__PURE__ */ import_react.default.createElement(Info, { size: 14, className: "mt-0.5 shrink-0", style: { color: NAVY } }), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs leading-relaxed", style: { color: "#3A4562" } }, children));
}
function analysePluieTemp(result, zoneTxt) {
  const tauxJoursPluie = result.n > 0 ? result.joursPluie / result.n : 0;
  const regularite = tauxJoursPluie >= 0.35 ? "une fr\xE9quence de jours pluvieux relativement r\xE9guli\xE8re" : tauxJoursPluie >= 0.2 ? "une fr\xE9quence de jours pluvieux mod\xE9r\xE9e" : "une fr\xE9quence de jours pluvieux faible, traduisant une pluviom\xE9trie concentr\xE9e sur peu d'\xE9v\xE9nements";
  const decisionTemp = result.tMaxAbs >= 38 ? " Les pics de temp\xE9rature maximale relev\xE9s (\u2265 38 \xB0C) exposent les cultures sensibles \xE0 un stress thermique lors des phases critiques (floraison, remplissage) : privil\xE9gier, sur cette zone, des vari\xE9t\xE9s tol\xE9rantes \xE0 la chaleur et un paillage limitant l'\xE9vaporation." : "";
  return `Sur ${zoneTxt}, le cumul pluviom\xE9trique observ\xE9 (${result.cumulPluie.toFixed(0)} mm sur ${result.n} jours) s'accompagne de ${regularite} (${result.joursPluie} jour(s) > ${RAIN_DAY_THRESHOLD_MM} mm).${decisionTemp} D\xE9cision op\xE9rationnelle : ajuster le calendrier des interventions culturales (semis, apports d'intrants) aux communes de la zone les mieux pourvues en jours pluvieux plut\xF4t qu'\xE0 la moyenne de zone, qui peut masquer des disparit\xE9s locales entre communes s\xE9lectionn\xE9es.`;
}
function analyseOmbrothermique(monthlyData, zoneTxt) {
  const moisSecs = monthlyData.filter((m) => (m.pluie || 0) < 2 * (m.tmoyenne || 0));
  const partSecs = monthlyData.length > 0 ? moisSecs.length / monthlyData.length : 0;
  const listeMois = moisSecs.map((m) => m.periode).join(", ");
  return `Selon la convention de Gaussen, ${moisSecs.length} mois sur ${monthlyData.length} sont class\xE9s secs sur ${zoneTxt}${moisSecs.length > 0 ? ` (${listeMois})` : ""}. ${partSecs >= 0.5 ? "La saison s\xE8che domine largement la p\xE9riode observ\xE9e : d\xE9cision \u2014 concentrer les semis pluviaux sur la fen\xEAtre humide restante et r\xE9server les mois secs identifi\xE9s aux cultures irrigu\xE9es ou aux activit\xE9s hors culture (stockage, transformation)." : "La p\xE9riode comporte une alternance de mois secs et humides : d\xE9cision \u2014 caler les semis en dehors des mois secs identifi\xE9s afin d'\xE9viter un d\xE9ficit hydrique en phase d'installation de la culture."}`;
}
function analyseBilanHydrique(result, zoneTxt) {
  if (result.bilanNet === null) return null;
  const excedent = result.bilanNet >= 0;
  return `Le bilan hydrique s\xE9quentiel (pluie \u2212 ET0) cumul\xE9 sur ${zoneTxt} atteint ${excedent ? "+" : ""}${result.bilanNet.toFixed(1)} mm sur la p\xE9riode. ${excedent ? "Cet exc\xE9dent traduit des apports pluviom\xE9triques sup\xE9rieurs \xE0 la demande \xE9vaporatoire cumul\xE9e : d\xE9cision \u2014 surveiller les risques d'exc\xE8s d'eau (engorgement, lessivage des intrants) sur les parcelles mal drain\xE9es de la zone plut\xF4t qu'un d\xE9ficit." : "Ce d\xE9ficit traduit une demande \xE9vaporatoire sup\xE9rieure aux apports pluviom\xE9triques cumul\xE9s sur la p\xE9riode : d\xE9cision \u2014 anticiper un besoin d'irrigation d'appoint ou de report des op\xE9rations culturales sensibles \xE0 l'eau (semis, repiquage) sur les communes de la zone les moins arros\xE9es."} Ce bilan reste un indicateur atmosph\xE9rique global (sans r\xE9serve utile du sol) \u2014 se r\xE9f\xE9rer \xE0 l'analyse par culture ci-dessous pour une estimation de l'eau r\xE9ellement disponible aux racines.`;
}
function analyseSequencesSeches(drySpellsRecalc, drySpellMinLength, zoneTxt) {
  if (!drySpellsRecalc || drySpellsRecalc.significant.length === 0) {
    return `Aucune s\xE9quence s\xE8che d'au moins ${drySpellMinLength} jours cons\xE9cutifs n'a \xE9t\xE9 d\xE9tect\xE9e sur ${zoneTxt} pour la p\xE9riode affich\xE9e : d\xE9cision \u2014 la r\xE9gularit\xE9 pluviom\xE9trique observ\xE9e ne justifie pas de mesure corrective particuli\xE8re sur ce plan, sous r\xE9serve de confirmation par les relev\xE9s de terrain (pluviom\xE8tres communaux).`;
  }
  return `${drySpellsRecalc.countSignificant} s\xE9quence(s) s\xE8che(s) significative(s) ont \xE9t\xE9 d\xE9tect\xE9es sur ${zoneTxt}, la plus longue s'\xE9tendant sur ${drySpellsRecalc.longest?.length} jours cons\xE9cutifs (${drySpellsRecalc.longest?.start} \u2192 ${drySpellsRecalc.longest?.end}). D\xE9cision op\xE9rationnelle : si cette s\xE9quence recoupe une phase sensible du cycle cultural (lev\xE9e, floraison, remplissage), recommander aux producteurs de la zone un semis diff\xE9r\xE9 apr\xE8s confirmation de l'installation des pluies, ou la mobilisation de techniques de conservation de l'eau (paillage, za\xEF, demi-lunes) sur les communes les plus expos\xE9es.`;
}
function analyseCultureEau(cropAnalysis, zoneTxt) {
  const ratioActuel = cropAnalysis.tawActuelle > 0 ? cropAnalysis.eauDisponibleActuelle / cropAnalysis.tawActuelle : null;
  const nStress = cropAnalysis.periodesStress.length;
  const decisionActuelle = ratioActuel !== null ? ratioActuel < 0.3 ? " La r\xE9serve en eau actuellement disponible dans la zone racinaire est proche de l'\xE9puisement (moins de 30 % de la r\xE9serve utile) : d\xE9cision \u2014 une irrigation d'appoint est recommand\xE9e dans les meilleurs d\xE9lais si l'irrigation est possible, sinon surveiller \xE9troitement les sympt\xF4mes de fl\xE9trissement sur les parcelles de la zone." : ratioActuel < 0.6 ? " La r\xE9serve en eau disponible se situe \xE0 un niveau interm\xE9diaire : d\xE9cision \u2014 maintenir une surveillance rapproch\xE9e et pr\xE9voir une irrigation d'appoint si aucune pluie utile n'intervient sous 5 \xE0 7 jours." : " La r\xE9serve en eau disponible demeure confortable \xE0 la date d'analyse : d\xE9cision \u2014 aucune intervention hydrique urgente n'est n\xE9cessaire sur cette zone pour la culture s\xE9lectionn\xE9e." : "";
  return `Pour la culture s\xE9lectionn\xE9e sur ${zoneTxt}, avec un sol de texture \xAB ${cropAnalysis.texture} \xBB (hypoth\xE8se par d\xE9faut, \xE0 confirmer localement), ${nStress} d\xE9cade(s) sur ${cropAnalysis.decades.length} pr\xE9sentent un coefficient de stress hydrique Ks inf\xE9rieur \xE0 0,9 (m\xE9thode FAO-56).${decisionActuelle} Cette estimation d\xE9pend directement de la texture de sol retenue : une v\xE9rification p\xE9dologique locale (sondage \xE0 la tari\xE8re, texture au toucher) est recommand\xE9e avant toute d\xE9cision d'irrigation engageant des co\xFBts significatifs.`;
}
function Climate({ active, onNavigate, userEmail, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const defaults = defaultDates();
  const [departements, setDepartements] = (0, import_react.useState)(["Borgou"]);
  const [communes, setCommunes] = (0, import_react.useState)(["Parakou"]);
  const [startDate, setStartDate] = (0, import_react.useState)(defaults.start);
  const [endDate, setEndDate] = (0, import_react.useState)(defaults.end);
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)("");
  const [et0Error, setEt0Error] = (0, import_react.useState)("");
  const [result, setResult] = (0, import_react.useState)(null);
  const [view, setView] = (0, import_react.useState)("jour");
  const [cropKey, setCropKey] = (0, import_react.useState)("mais");
  const [sowingDate, setSowingDate] = (0, import_react.useState)("");
  const [drySpellMinLength, setDrySpellMinLength] = (0, import_react.useState)(7);
  const [soilTexture, setSoilTexture] = (0, import_react.useState)(DEFAULT_SOIL_TEXTURE);
  const toggleDepartement = (dep) => {
    setDepartements((prev) => {
      const next = prev.includes(dep) ? prev.filter((d) => d !== dep) : [...prev, dep];
      if (prev.includes(dep)) {
        const communesDuDep = BENIN_DEPARTEMENTS.find((d) => d.departement === dep)?.communes || [];
        setCommunes((c) => c.filter((cc) => !communesDuDep.includes(cc)));
      }
      return next;
    });
  };
  const toggleCommune = (c) => setCommunes((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const fetchClimate = async () => {
    if (communes.length === 0) {
      setError("S\xE9lectionnez au moins une commune.");
      return;
    }
    const validCommunes = communes.filter((c) => COMMUNE_COORDS[c]);
    if (validCommunes.length === 0) {
      setError("Coordonn\xE9es non disponibles pour les communes s\xE9lectionn\xE9es.");
      return;
    }
    setLoading(true);
    setError("");
    setEt0Error("");
    setResult(null);
    const isoStart = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
    const isoEnd = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;
    const fetchOneCommune = async (c) => {
      const coords = COMMUNE_COORDS[c];
      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,T2M&community=AG&longitude=${coords.lon}&latitude=${coords.lat}&start=${startDate}&end=${endDate}&format=JSON`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NASA POWER a r\xE9pondu avec le code ${res.status} pour ${c}.`);
      const data = await res.json();
      const params = data?.properties?.parameter;
      if (!params) throw new Error(data?.messages?.[0] || `R\xE9ponse inattendue du service NASA POWER pour ${c}.`);
      const dates = Object.keys(params.PRECTOTCORR || {}).sort();
      let daily = dates.map((d) => ({
        dateISO: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
        date: `${d.slice(6, 8)}/${d.slice(4, 6)}`,
        pluie: params.PRECTOTCORR[d] === -999 ? null : params.PRECTOTCORR[d],
        tmax: params.T2M_MAX[d] === -999 ? null : params.T2M_MAX[d],
        tmin: params.T2M_MIN[d] === -999 ? null : params.T2M_MIN[d],
        et0: null
      })).filter((d) => d.pluie !== null);
      try {
        const omUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${isoStart}&end_date=${isoEnd}&daily=et0_fao_evapotranspiration&timezone=UTC`;
        const omRes = await fetch(omUrl);
        if (!omRes.ok) throw new Error(`code ${omRes.status}`);
        const omData = await omRes.json();
        const omDates = omData?.daily?.time || [];
        const omEt0 = omData?.daily?.et0_fao_evapotranspiration || [];
        const et0ByDate = new Map(omDates.map((d, i) => [d, omEt0[i]]));
        daily = daily.map((d) => ({ ...d, et0: et0ByDate.has(d.dateISO) && et0ByDate.get(d.dateISO) !== null ? et0ByDate.get(d.dateISO) : null }));
      } catch (e) {
      }
      return daily;
    };
    try {
      const outcomes = await Promise.allSettled(validCommunes.map(fetchOneCommune));
      const succeeded = outcomes.filter((o) => o.status === "fulfilled").map((o) => o.value);
      if (succeeded.length === 0) {
        const firstErrorDetail = outcomes.find((o) => o.status === "rejected")?.reason?.message;
        throw new Error(firstErrorDetail || "Impossible de r\xE9cup\xE9rer des donn\xE9es pour aucune des communes s\xE9lectionn\xE9es.");
      }
      let daily = averageDailyAcrossCommunes(succeeded);
      if (daily.length === 0) throw new Error("Aucune donn\xE9e exploitable sur la p\xE9riode demand\xE9e (essayez une p\xE9riode plus ancienne).");
      if (!daily.some((d) => d.et0 !== null)) {
        setEt0Error("\xC9vapotranspiration (ET0) indisponible pour cette p\xE9riode/zone (service Open-Meteo) \u2014 le bilan hydrique et l'analyse par culture ne peuvent pas \xEAtre calcul\xE9s tant que cette donn\xE9e manque.");
      }
      const nEchec = validCommunes.length - succeeded.length;
      if (nEchec > 0) {
        setEt0Error((prev) => (prev ? prev + " " : "") + `${nEchec} commune(s) sur ${validCommunes.length} n'ont pas pu \xEAtre r\xE9cup\xE9r\xE9es et sont exclues de la moyenne de zone.`);
      }
      daily = computeWaterBalance(daily);
      const cumulPluie = daily.reduce((s, d) => s + (d.pluie || 0), 0);
      const joursPluie = daily.filter((d) => d.pluie > RAIN_DAY_THRESHOLD_MM).length;
      const tMaxAbs = Math.max(...daily.map((d) => d.tmax).filter((v) => v !== null));
      const tMinAbs = Math.min(...daily.map((d) => d.tmin).filter((v) => v !== null));
      const tMoyenne = daily.reduce((s, d) => s + (d.tmax + d.tmin) / 2, 0) / daily.length;
      const et0Cumule = daily.reduce((s, d) => s + (d.et0 || 0), 0);
      const bilanNet = daily.length > 0 ? daily[daily.length - 1].bilanCumule : null;
      const drySpells = detectDrySpells(daily, RAIN_DAY_THRESHOLD_MM, Number(drySpellMinLength) || 7);
      setResult({ daily, cumulPluie, joursPluie, tMaxAbs, tMinAbs, tMoyenne, n: daily.length, et0Cumule, bilanNet, drySpells, communesUtilisees: succeeded.length });
      if (!sowingDate) setSowingDate(daily[0]?.dateISO || "");
    } catch (e) {
      if (e instanceof TypeError) {
        setError("Impossible de joindre le service NASA POWER (connexion r\xE9seau ou blocage temporaire). V\xE9rifiez votre connexion internet et r\xE9essayez dans quelques instants.");
      } else {
        setError(e.message || "\xC9chec de la r\xE9cup\xE9ration des donn\xE9es climatiques.");
      }
    } finally {
      setLoading(false);
    }
  };
  const monthlyData = (0, import_react.useMemo)(() => result ? aggregateByPeriod(result.daily, "mois") : [], [result]);
  const quarterlyData = (0, import_react.useMemo)(() => result ? aggregateByPeriod(result.daily, "trimestre") : [], [result]);
  const periodData = view === "jour" ? result?.daily : view === "mois" ? monthlyData : quarterlyData;
  const periodKey = view === "jour" ? "date" : "periode";
  const ombroMax = (0, import_react.useMemo)(() => {
    if (monthlyData.length === 0) return { temp: 40, pluie: 80 };
    const maxTemp = Math.max(...monthlyData.map((m) => m.tmoyenne || 0));
    return { temp: Math.ceil(maxTemp * 1.2 / 5) * 5, pluie: Math.ceil(maxTemp * 1.2 * 2 / 20) * 20 };
  }, [monthlyData]);
  const cropAnalysis = (0, import_react.useMemo)(() => {
    if (!result || !sowingDate || !cropKey) return null;
    return computeCropWaterSatisfaction(result.daily, cropKey, sowingDate, soilTexture);
  }, [result, sowingDate, cropKey, soilTexture]);
  const drySpellsRecalc = (0, import_react.useMemo)(() => {
    if (!result) return null;
    return detectDrySpells(result.daily, RAIN_DAY_THRESHOLD_MM, Number(drySpellMinLength) || 7);
  }, [result, drySpellMinLength]);
  const zoneTxt = (0, import_react.useMemo)(() => zoneDescription(communes, departements), [communes, departements]);
  const pluieChartRef = (0, import_react.useRef)(null);
  const tempChartRef = (0, import_react.useRef)(null);
  const ombroChartRef = (0, import_react.useRef)(null);
  const bilanChartRef = (0, import_react.useRef)(null);
  const exportExcel = () => {
    if (!result) return;
    const rows = result.daily.map((d) => ({
      Date: d.dateISO,
      "Pluie (mm)": d.pluie !== null ? Number(d.pluie.toFixed(2)) : "",
      "T\xB0 max (\xB0C)": d.tmax !== null ? Number(d.tmax.toFixed(2)) : "",
      "T\xB0 min (\xB0C)": d.tmin !== null ? Number(d.tmin.toFixed(2)) : "",
      "ET0 (mm)": d.et0 !== null && d.et0 !== void 0 ? Number(d.et0.toFixed(2)) : "",
      "Bilan du jour P-ET0 (mm)": d.bilanJour !== null && d.bilanJour !== void 0 ? Number(d.bilanJour.toFixed(2)) : "",
      "Bilan cumul\xE9 (mm)": d.bilanCumule !== null && d.bilanCumule !== void 0 ? Number(d.bilanCumule.toFixed(2)) : ""
    }));
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(rows);
    utils.book_append_sheet(wb, ws, "Donn\xE9es journali\xE8res");
    const wsMeta = utils.json_to_sheet([{
      "Zone d'intervention (communes)": communes.join(", "),
      "D\xE9partement(s)": departements.join(", "),
      "Communes effectivement moyenn\xE9es": result.communesUtilisees,
      "P\xE9riode de d\xE9but": startDate,
      "P\xE9riode de fin": endDate,
      "Cumul pluviom\xE9trique moyen (mm)": Number(result.cumulPluie.toFixed(1)),
      "ET0 cumul\xE9e moyenne (mm)": Number(result.et0Cumule.toFixed(1)),
      "Sources": "NASA POWER (pluie, temp\xE9ratures) \xB7 Open-Meteo Archive API (ET0, FAO-56 Penman-Monteith) \u2014 moyenne journali\xE8re des communes de la zone d'intervention"
    }]);
    utils.book_append_sheet(wb, wsMeta, "M\xE9tadonn\xE9es");
    writeFileSync(wb, `AgroMeteo_${communes.length > 1 ? "zone" : communes[0]}_${startDate}_${endDate}.xlsx`);
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex" }, /* @__PURE__ */ import_react.default.createElement(Sidebar, { active, onNavigate }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 min-h-screen" }, /* @__PURE__ */ import_react.default.createElement(
    "header",
    {
      className: "bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between",
      style: { borderBottom: `2px solid ${GOLD}` }
    },
    /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", { className: "font-serif text-xl font-bold", style: { color: NAVY } }, "Situation agrom\xE9t\xE9orologique"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-500 mt-0.5" }, "Donn\xE9es NASA POWER & Open-Meteo, par localit\xE9 \u2014 B\xE9nin")),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-4" }, result && /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        onClick: exportExcel,
        className: "text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white",
        style: { background: GREEN }
      },
      /* @__PURE__ */ import_react.default.createElement(Download, { size: 13 }),
      " Extraire les donn\xE9es (.xlsx)"
    ), /* @__PURE__ */ import_react.default.createElement(Bell, { size: 18, className: "text-gray-400" }), /* @__PURE__ */ import_react.default.createElement(
      UserMenu,
      {
        email: userEmail,
        roleLabel,
        isAdmin,
        isGuest,
        onLogout,
        onOpenAdmin
      }
    ))
  ), /* @__PURE__ */ import_react.default.createElement("main", { className: "p-8" }, /* @__PURE__ */ import_react.default.createElement(Card, { className: "mb-5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600" }, "Zone d'intervention \u2014 d\xE9partement(s)"), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-400" }, communes.length, " commune", communes.length > 1 ? "s" : "", " s\xE9lectionn\xE9e", communes.length > 1 ? "s" : "", " \u2014 la moyenne journali\xE8re de la zone sera calcul\xE9e")), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-2 mb-3" }, BENIN_DEPARTEMENTS.map((d) => /* @__PURE__ */ import_react.default.createElement(Chip, { key: d.departement, label: d.departement, active: departements.includes(d.departement), onClick: () => toggleDepartement(d.departement) }))), departements.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "mb-3" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Communes"), departements.map((dep) => {
    const communesDuDep = BENIN_DEPARTEMENTS.find((d) => d.departement === dep)?.communes || [];
    return /* @__PURE__ */ import_react.default.createElement("div", { key: dep, className: "mb-2" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-400 mb-1" }, dep), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-1.5" }, communesDuDep.map((c) => /* @__PURE__ */ import_react.default.createElement(Chip, { key: c, label: c, color: GREEN, active: communes.includes(c), onClick: () => toggleCommune(c) }))));
  })), communes.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-1.5 mb-4" }, communes.map((c) => /* @__PURE__ */ import_react.default.createElement("span", { key: c, className: "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full", style: { background: NAVY_TINT, color: NAVY } }, c, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => toggleCommune(c), className: "hover:text-red-500" }, /* @__PURE__ */ import_react.default.createElement(X, { size: 11 }))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-3 items-end" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "P\xE9riode"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "date",
      value: `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`,
      onChange: (e) => setStartDate(e.target.value.replace(/-/g, "")),
      className: "w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "date",
      value: `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`,
      onChange: (e) => setEndDate(e.target.value.replace(/-/g, "")),
      className: "w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ))), /* @__PURE__ */ import_react.default.createElement("div", { className: "col-span-2" }, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: fetchClimate,
      disabled: loading || communes.length === 0,
      className: "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-white shadow-md disabled:opacity-60",
      style: { background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }
    },
    loading ? /* @__PURE__ */ import_react.default.createElement(LoaderCircle, { size: 15, className: "animate-spin" }) : /* @__PURE__ */ import_react.default.createElement(RefreshCw, { size: 15 }),
    " Afficher"
  ))), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-[11px] text-gray-400 mt-2" }, "Pluie et temp\xE9ratures : NASA POWER (communaut\xE9 agroclimatique) \xB7 \xC9vapotranspiration de r\xE9f\xE9rence (ET0) : Open-Meteo, m\xE9thode FAO-56 Penman-Monteith \u2014 moyenne journali\xE8re calcul\xE9e sur l'ensemble des communes coch\xE9es \xB7 publication diff\xE9r\xE9e de quelques jours.")), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-2 rounded-xl p-4 mb-5", style: { background: RED_TINT, color: RED } }, /* @__PURE__ */ import_react.default.createElement(CircleAlert, { size: 16, className: "mt-0.5 shrink-0" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm" }, /* @__PURE__ */ import_react.default.createElement("p", null, error), /* @__PURE__ */ import_react.default.createElement(
    "a",
    {
      href: `https://power.larc.nasa.gov/data-access-viewer/`,
      target: "_blank",
      rel: "noreferrer",
      className: "underline font-medium inline-block mt-1"
    },
    "Consulter directement le site NASA POWER"
  ))), et0Error && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-2 rounded-xl p-3 mb-5", style: { background: AMBER_TINT, color: AMBER } }, /* @__PURE__ */ import_react.default.createElement(TriangleAlert, { size: 14, className: "mt-0.5 shrink-0" }), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs" }, et0Error)), result && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 lg:grid-cols-6 gap-4 mb-5" }, /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement(CloudRain, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-xl font-bold mt-2", style: { color: NAVY } }, result.cumulPluie.toFixed(1), " mm"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Cumul pluviom\xE9trique")), /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement(Droplets, { size: 18, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-xl font-bold mt-2", style: { color: NAVY } }, result.joursPluie, " j"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Jours de pluie (> ", RAIN_DAY_THRESHOLD_MM, " mm) sur ", result.n)), /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement(Thermometer, { size: 18, style: { color: RED } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-xl font-bold mt-2", style: { color: NAVY } }, result.tMaxAbs.toFixed(1), " \xB0C"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Temp\xE9rature maximale")), /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement(Thermometer, { size: 18, style: { color: "#3592C4" } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-xl font-bold mt-2", style: { color: NAVY } }, result.tMinAbs.toFixed(1), " \xB0C"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Temp\xE9rature minimale")), /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement(Sun, { size: 18, style: { color: "#B5651D" } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-xl font-bold mt-2", style: { color: NAVY } }, result.et0Cumule > 0 ? `${result.et0Cumule.toFixed(1)} mm` : "\u2014"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "ET0 cumul\xE9e")), /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement(WavesHorizontal, { size: 18, style: { color: result.bilanNet >= 0 ? GREEN : RED } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-serif text-xl font-bold mt-2", style: { color: result.bilanNet >= 0 ? GREEN : RED } }, result.bilanNet !== null ? `${result.bilanNet >= 0 ? "+" : ""}${result.bilanNet.toFixed(1)} mm` : "\u2014"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Bilan hydrique net (P \u2212 ET0)"))), /* @__PURE__ */ import_react.default.createElement(Card, { className: "mb-5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Pr\xE9cipitations et temp\xE9ratures"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex gap-1.5" }, [["jour", "Jour"], ["mois", "Cumul mensuel"], ["trimestre", "Cumul trimestriel"]].map(([k, l]) => /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      key: k,
      onClick: () => setView(k),
      className: "px-3 py-1.5 rounded-lg text-xs font-medium",
      style: view === k ? { background: NAVY, color: "white" } : { background: "#F1F2F6", color: "#5A6478" }
    },
    l
  )))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400" }, view === "jour" ? "Pluie journali\xE8re (mm)" : `Pluie cumul\xE9e par ${view} (mm)`), /* @__PURE__ */ import_react.default.createElement(ChartExportButton, { targetRef: pluieChartRef, filename: `Pluie_${view}_${communes.join("-")}` })), /* @__PURE__ */ import_react.default.createElement("div", { ref: pluieChartRef }, /* @__PURE__ */ import_react.default.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ import_react.default.createElement(BarChart, { data: periodData }, /* @__PURE__ */ import_react.default.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EDEDED" }), /* @__PURE__ */ import_react.default.createElement(XAxis, { dataKey: periodKey, tick: { fontSize: 10 }, interval: view === "jour" ? Math.ceil((periodData?.length || 1) / 8) : 0 }), /* @__PURE__ */ import_react.default.createElement(YAxis, { tick: { fontSize: 11 }, unit: " mm", width: 50 }), /* @__PURE__ */ import_react.default.createElement(Tooltip, null), /* @__PURE__ */ import_react.default.createElement(Bar, { dataKey: "pluie", fill: "#3592C4", radius: [3, 3, 0, 0], name: "Pluie (mm)" }))))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400" }, view === "jour" ? "Temp\xE9ratures journali\xE8res (\xB0C)" : `Temp\xE9rature moyenne par ${view} (\xB0C)`), /* @__PURE__ */ import_react.default.createElement(ChartExportButton, { targetRef: tempChartRef, filename: `Temperatures_${view}_${communes.join("-")}` })), /* @__PURE__ */ import_react.default.createElement("div", { ref: tempChartRef }, /* @__PURE__ */ import_react.default.createElement(ResponsiveContainer, { width: "100%", height: 220 }, view === "jour" ? /* @__PURE__ */ import_react.default.createElement(LineChart, { data: periodData }, /* @__PURE__ */ import_react.default.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EDEDED" }), /* @__PURE__ */ import_react.default.createElement(XAxis, { dataKey: "date", tick: { fontSize: 10 }, interval: Math.ceil((periodData?.length || 1) / 8) }), /* @__PURE__ */ import_react.default.createElement(YAxis, { tick: { fontSize: 11 }, unit: "\xB0C", width: 45 }), /* @__PURE__ */ import_react.default.createElement(Tooltip, null), /* @__PURE__ */ import_react.default.createElement(Line, { type: "monotone", dataKey: "tmax", stroke: RED, strokeWidth: 2, dot: false, name: "T\xB0 max" }), /* @__PURE__ */ import_react.default.createElement(Line, { type: "monotone", dataKey: "tmin", stroke: "#3592C4", strokeWidth: 2, dot: false, name: "T\xB0 min" })) : /* @__PURE__ */ import_react.default.createElement(LineChart, { data: periodData }, /* @__PURE__ */ import_react.default.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EDEDED" }), /* @__PURE__ */ import_react.default.createElement(XAxis, { dataKey: "periode", tick: { fontSize: 10 } }), /* @__PURE__ */ import_react.default.createElement(YAxis, { tick: { fontSize: 11 }, unit: "\xB0C", width: 45 }), /* @__PURE__ */ import_react.default.createElement(Tooltip, null), /* @__PURE__ */ import_react.default.createElement(Line, { type: "monotone", dataKey: "tmoyenne", stroke: RED, strokeWidth: 2, dot: true, name: "T\xB0 moyenne" })))))), /* @__PURE__ */ import_react.default.createElement(AnalysisNote, null, analysePluieTemp(result, zoneTxt))), /* @__PURE__ */ import_react.default.createElement(Card, { className: "mb-5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(Sun, { size: 16, style: { color: GOLD } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Diagramme ombrothermique (Gaussen)")), /* @__PURE__ */ import_react.default.createElement(ChartExportButton, { targetRef: ombroChartRef, filename: `Diagramme_ombrothermique_${communes.join("-")}` })), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-3" }, "Convention de Gaussen : un mois est consid\xE9r\xE9 sec lorsque le cumul pluviom\xE9trique (mm) descend sous le double de la temp\xE9rature moyenne (\xB0C) \u2014 zone gris\xE9e sur le graphique."), /* @__PURE__ */ import_react.default.createElement("div", { ref: ombroChartRef }, /* @__PURE__ */ import_react.default.createElement(ResponsiveContainer, { width: "100%", height: 260 }, /* @__PURE__ */ import_react.default.createElement(ComposedChart, { data: monthlyData }, /* @__PURE__ */ import_react.default.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EDEDED" }), /* @__PURE__ */ import_react.default.createElement(XAxis, { dataKey: "periode", tick: { fontSize: 11 } }), /* @__PURE__ */ import_react.default.createElement(YAxis, { yAxisId: "temp", tick: { fontSize: 11 }, unit: "\xB0C", width: 45, domain: [0, ombroMax.temp] }), /* @__PURE__ */ import_react.default.createElement(YAxis, { yAxisId: "pluie", orientation: "right", tick: { fontSize: 11 }, unit: " mm", width: 50, domain: [0, ombroMax.pluie] }), /* @__PURE__ */ import_react.default.createElement(Tooltip, null), /* @__PURE__ */ import_react.default.createElement(Legend, { wrapperStyle: { fontSize: 11 } }), /* @__PURE__ */ import_react.default.createElement(Bar, { yAxisId: "pluie", dataKey: "pluie", fill: "#A9C7E8", name: "Pluie cumul\xE9e (mm)", radius: [3, 3, 0, 0] }), /* @__PURE__ */ import_react.default.createElement(Line, { yAxisId: "temp", type: "monotone", dataKey: "tmoyenne", stroke: RED, strokeWidth: 2.5, name: "Temp\xE9rature moyenne (\xB0C)", dot: true })))), monthlyData.length > 0 && /* @__PURE__ */ import_react.default.createElement(AnalysisNote, null, analyseOmbrothermique(monthlyData, zoneTxt))), /* @__PURE__ */ import_react.default.createElement(Card, { className: "mb-5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(WavesHorizontal, { size: 16, style: { color: "#3592C4" } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Bilan hydrique s\xE9quentiel (P \u2212 ET0)")), result.daily.some((d) => d.et0 !== null) && /* @__PURE__ */ import_react.default.createElement(ChartExportButton, { targetRef: bilanChartRef, filename: `Bilan_hydrique_${communes.join("-")}` })), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-3" }, "Bilan cumul\xE9 = somme courante de (pluie \u2212 ET0) depuis le d\xE9but de la p\xE9riode affich\xE9e. Une valeur positive indique un exc\xE9dent hydrique disponible, une valeur n\xE9gative un d\xE9ficit. Estimation simplifi\xE9e, sans prise en compte de la r\xE9serve utile du sol ni du ruissellement."), result.daily.some((d) => d.et0 !== null) ? /* @__PURE__ */ import_react.default.createElement("div", { ref: bilanChartRef }, /* @__PURE__ */ import_react.default.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ import_react.default.createElement(LineChart, { data: result.daily }, /* @__PURE__ */ import_react.default.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EDEDED" }), /* @__PURE__ */ import_react.default.createElement(XAxis, { dataKey: "date", tick: { fontSize: 10 }, interval: Math.ceil(result.daily.length / 8) }), /* @__PURE__ */ import_react.default.createElement(YAxis, { tick: { fontSize: 11 }, unit: " mm", width: 55 }), /* @__PURE__ */ import_react.default.createElement(Tooltip, null), /* @__PURE__ */ import_react.default.createElement(ReferenceLine, { y: 0, stroke: "#B0B7C6", strokeDasharray: "4 4" }), /* @__PURE__ */ import_react.default.createElement(Line, { type: "monotone", dataKey: "bilanCumule", stroke: GREEN, strokeWidth: 2, dot: false, name: "Bilan cumul\xE9 (mm)" })))) : /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 text-xs text-gray-400 italic", style: { background: "#F7F8FA" } }, "Le bilan hydrique ne peut pas \xEAtre calcul\xE9 : l'\xE9vapotranspiration de r\xE9f\xE9rence (ET0) n'a pas pu \xEAtre r\xE9cup\xE9r\xE9e pour cette p\xE9riode."), result.daily.some((d) => d.et0 !== null) && /* @__PURE__ */ import_react.default.createElement(AnalysisNote, null, analyseBilanHydrique(result, zoneTxt))), /* @__PURE__ */ import_react.default.createElement(Card, { className: "mb-5" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(TriangleAlert, { size: 16, style: { color: AMBER } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "S\xE9quences s\xE8ches")), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 text-xs text-gray-500" }, "Seuil de signalement :", /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "number",
      min: 2,
      max: 30,
      value: drySpellMinLength,
      onChange: (e) => setDrySpellMinLength(e.target.value),
      className: "w-16 text-xs rounded-lg border border-gray-200 p-1.5 focus:outline-none"
    }
  ), "jours cons\xE9cutifs sans pluie utile (\u2264 ", RAIN_DAY_THRESHOLD_MM, " mm)")), drySpellsRecalc && drySpellsRecalc.significant.length > 0 ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-500 mb-3" }, drySpellsRecalc.countSignificant, " s\xE9quence", drySpellsRecalc.countSignificant > 1 ? "s" : "", " s\xE8che", drySpellsRecalc.countSignificant > 1 ? "s" : "", " significative", drySpellsRecalc.countSignificant > 1 ? "s" : "", " d\xE9tect\xE9e", drySpellsRecalc.countSignificant > 1 ? "s" : "", " sur la p\xE9riode \u2014 la plus longue dure ", drySpellsRecalc.longest?.length, " jours (", drySpellsRecalc.longest?.start, " \u2192 ", drySpellsRecalc.longest?.end, ")."), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1.5" }, drySpellsRecalc.significant.slice(0, 8).map((s, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i, className: "flex items-center justify-between rounded-lg px-3 py-2 text-xs", style: { background: AMBER_TINT } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { color: AMBER } }, "Du ", s.start, " au ", s.end), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-semibold", style: { color: AMBER } }, s.length, " jours"))))) : /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 text-xs text-gray-400 italic", style: { background: "#F7F8FA" } }, "Aucune s\xE9quence s\xE8che d'au moins ", drySpellMinLength, " jours cons\xE9cutifs d\xE9tect\xE9e sur la p\xE9riode."), /* @__PURE__ */ import_react.default.createElement(AnalysisNote, null, analyseSequencesSeches(drySpellsRecalc, drySpellMinLength, zoneTxt))), /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ import_react.default.createElement(Sprout, { size: 16, style: { color: GREEN } }), /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Satisfaction des besoins en eau par culture")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-3" }, "M\xE9thode des coefficients culturaux (Kc) et bilan hydrique de la zone racinaire \u2014 FAO Irrigation and Drainage Paper n\xB056 (Allen, Pereira, Raes & Smith, 1998, chap. 8). ETc = Kc \xD7 ET0 ; eau disponible = r\xE9serve utile (TAW) \u2212 d\xE9pl\xE9tion (Dr), avec coefficient de stress Ks selon les \xE9quations 82 \xE0 85 de la FAO-56. Indice de satisfaction (ISE) = pluie d\xE9cadaire / ETc d\xE9cadaire, fourni \xE0 titre compl\xE9mentaire."), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-4 gap-3 mb-4" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Culture"), /* @__PURE__ */ import_react.default.createElement(
    "select",
    {
      value: cropKey,
      onChange: (e) => setCropKey(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none"
    },
    Object.entries(CROP_KC_TABLE).map(([k, c]) => /* @__PURE__ */ import_react.default.createElement("option", { key: k, value: k }, c.label))
  )), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Date de semis"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "date",
      value: sowingDate,
      onChange: (e) => setSowingDate(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none"
    }
  )), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Texture du sol"), /* @__PURE__ */ import_react.default.createElement(
    "select",
    {
      value: soilTexture,
      onChange: (e) => setSoilTexture(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none"
    },
    Object.entries(SOIL_TEXTURE_TABLE).map(([k, t]) => /* @__PURE__ */ import_react.default.createElement("option", { key: k, value: k }, t.label))
  )), cropAnalysis && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 flex flex-col justify-center", style: { background: NAVY_TINT } }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-500" }, "Fin de cycle estim\xE9e"), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-sm font-semibold", style: { color: NAVY } }, cropAnalysis.dateFinCycleISO, " (", cropAnalysis.cycleLength, " j)"))), !result.daily.some((d) => d.et0 !== null) ? /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 text-xs text-gray-400 italic", style: { background: "#F7F8FA" } }, "L'analyse par culture n\xE9cessite l'\xE9vapotranspiration de r\xE9f\xE9rence (ET0), indisponible pour cette p\xE9riode.") : cropAnalysis && cropAnalysis.decades.length > 0 ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-3 gap-3 mb-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3", style: { background: NAVY_TINT } }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-500" }, "R\xE9serve utile (TAW), enracinement actuel"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-semibold", style: { color: NAVY } }, cropAnalysis.tawActuelle !== null ? `${cropAnalysis.tawActuelle.toFixed(0)} mm` : "\u2014")), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3", style: { background: cropAnalysis.ksActuel >= 0.9 ? GREEN_TINT : cropAnalysis.ksActuel >= 0.5 ? AMBER_TINT : RED_TINT } }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px]", style: { color: cropAnalysis.ksActuel >= 0.9 ? GREEN : cropAnalysis.ksActuel >= 0.5 ? AMBER : RED } }, "Eau disponible pour la plante (TAW \u2212 Dr)"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-semibold", style: { color: cropAnalysis.ksActuel >= 0.9 ? GREEN : cropAnalysis.ksActuel >= 0.5 ? AMBER : RED } }, cropAnalysis.eauDisponibleActuelle !== null ? `${cropAnalysis.eauDisponibleActuelle.toFixed(0)} mm` : "\u2014", cropAnalysis.tawActuelle > 0 && ` (${(cropAnalysis.eauDisponibleActuelle / cropAnalysis.tawActuelle * 100).toFixed(0)} % de la TAW)`)), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3", style: { background: NAVY_TINT } }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-500" }, "Coefficient de stress hydrique (Ks)"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-semibold", style: { color: NAVY } }, cropAnalysis.ksActuel !== null ? cropAnalysis.ksActuel.toFixed(2) : "\u2014"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 mb-4 flex items-center gap-3", style: { background: cropAnalysis.iseGlobal >= 1 ? GREEN_TINT : cropAnalysis.iseGlobal >= 0.5 ? AMBER_TINT : RED_TINT } }, /* @__PURE__ */ import_react.default.createElement(Info, { size: 15, style: { color: cropAnalysis.iseGlobal >= 1 ? GREEN : cropAnalysis.iseGlobal >= 0.5 ? AMBER : RED } }), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs", style: { color: cropAnalysis.iseGlobal >= 1 ? GREEN : cropAnalysis.iseGlobal >= 0.5 ? AMBER : RED } }, "Sur la portion du cycle couverte par les donn\xE9es disponibles : ", cropAnalysis.totalPluie.toFixed(0), " mm de pluie pour ", cropAnalysis.totalEtc.toFixed(0), " mm de besoins (ETc) \u2014 indice de satisfaction global ", cropAnalysis.iseGlobal !== null ? cropAnalysis.iseGlobal.toFixed(2) : "\u2014", ".", cropAnalysis.periodesStress.length > 0 && ` ${cropAnalysis.periodesStress.length} d\xE9cade(s) en situation de stress hydrique (Ks < 0,9).`)), /* @__PURE__ */ import_react.default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ import_react.default.createElement("table", { className: "text-xs w-full" }, /* @__PURE__ */ import_react.default.createElement("thead", null, /* @__PURE__ */ import_react.default.createElement("tr", null, /* @__PURE__ */ import_react.default.createElement("th", { className: "text-left text-[10px] text-gray-400 uppercase pb-2" }, "P\xE9riode (d\xE9cade)"), /* @__PURE__ */ import_react.default.createElement("th", { className: "text-left text-[10px] text-gray-400 uppercase pb-2" }, "Stade"), /* @__PURE__ */ import_react.default.createElement("th", { className: "text-right text-[10px] text-gray-400 uppercase pb-2" }, "Pluie (mm)"), /* @__PURE__ */ import_react.default.createElement("th", { className: "text-right text-[10px] text-gray-400 uppercase pb-2" }, "ETc (mm)"), /* @__PURE__ */ import_react.default.createElement("th", { className: "text-right text-[10px] text-gray-400 uppercase pb-2" }, "Eau disponible (mm)"), /* @__PURE__ */ import_react.default.createElement("th", { className: "text-right text-[10px] text-gray-400 uppercase pb-2" }, "Ks"), /* @__PURE__ */ import_react.default.createElement("th", { className: "text-right text-[10px] text-gray-400 uppercase pb-2" }, "ISE"), /* @__PURE__ */ import_react.default.createElement("th", { className: "text-right text-[10px] text-gray-400 uppercase pb-2" }, "Statut"))), /* @__PURE__ */ import_react.default.createElement("tbody", null, cropAnalysis.decades.map((d, i) => /* @__PURE__ */ import_react.default.createElement("tr", { key: i, className: "border-t border-gray-50" }, /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-gray-700" }, d.dateDebut, " \u2192 ", d.dateFin), /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-gray-500" }, d.stage), /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-right text-gray-700" }, d.pluieCumul.toFixed(1)), /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-right text-gray-700" }, d.etcCumul.toFixed(1)), /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-right font-mono text-gray-600" }, d.eauDisponible.toFixed(0), " / ", d.taw.toFixed(0)), /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-right font-mono text-gray-600" }, d.ksMoyen !== null ? d.ksMoyen.toFixed(2) : "\u2014"), /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-right font-mono text-gray-600" }, d.ise !== null ? d.ise.toFixed(2) : "\u2014"), /* @__PURE__ */ import_react.default.createElement("td", { className: "py-1.5 text-right" }, /* @__PURE__ */ import_react.default.createElement(StatusPill, { statut: d.statut }))))))), /* @__PURE__ */ import_react.default.createElement(AnalysisNote, null, analyseCultureEau(cropAnalysis, zoneTxt))) : /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 text-xs text-gray-400 italic", style: { background: "#F7F8FA" } }, "Choisissez une date de semis comprise dans (ou proche de) la p\xE9riode import\xE9e pour lancer l'analyse."))), !result && !error && !loading && /* @__PURE__ */ import_react.default.createElement(Card, { className: "text-center py-12" }, /* @__PURE__ */ import_react.default.createElement(MapPin, { size: 32, className: "mx-auto text-gray-300 mb-3" }), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm text-gray-500" }, "Choisissez une ou plusieurs communes et une p\xE9riode, puis cliquez \xAB Afficher \xBB."))))));
}
export {
  Climate as default
};
