// Module de calculs agroclimatiques : bilan hydrique du sol dans la zone racinaire (méthode
// FAO Irrigation and Drainage Paper n°56, Allen, Pereira, Raes & Smith, 1998, chapitre 8),
// satisfaction des besoins en eau par culture et détection des séquences sèches / périodes de
// stress hydrique. Toutes les valeurs de Kc, de durée de stade, de profondeur racinaire et de
// fraction de tarissement sont des valeurs indicatives pour la zone soudano-guinéenne (Bénin) —
// à ajuster selon la variété, la date réelle de semis, le type de sol et la conduite culturale
// observées sur le terrain.
//
// Quantité d'eau disponible pour la plante — méthode retenue (FAO-56, chap. 8) :
//   TAW = AWC(texture) × Zr(t)              — eq. 82 : réserve utile totale (mm), fonction de la
//                                               profondeur racinaire effective Zr(t) (m), croissante
//                                               au cours du cycle, et de la réserve utile par mètre
//                                               de sol AWC selon la texture (mm/m).
//   RAW = p(t) × TAW                         — eq. 83 : réserve facilement utilisable (mm), p = fraction
//                                               de tarissement sans stress (Tableau 22, FAO-56),
//                                               ajustée selon l'ETc du jour (note sous eq. 84 : p =
//                                               pTable22 + 0,04·(5 − ETc), bornée [0,1 ; 0,8]).
//   Ks = 1                          si Dr ≤ RAW
//   Ks = (TAW − Dr) / (TAW − RAW)   si Dr > RAW   — eq. 84 : coefficient de stress hydrique.
//   Dr,i = Dr,i-1 − Peff,i + Ks,i-1·ETc,i     — eq. 85 simplifiée (sans irrigation ni remontée
//                                               capillaire, non pertinentes en riziculture pluviale
//                                               non irriguée), Dr borné à [0, TAW] : l'excédent au-delà
//                                               de TAW est assimilé à un drainage profond (percolation).
//   Eau disponible = TAW − Dr                 — quantité d'eau effectivement mobilisable par les
//                                               racines à un instant donné (mm), 0 au point de
//                                               flétrissement permanent, TAW à la capacité au champ.
// Références :
//  - Allen R.G., Pereira L.S., Raes D., Smith M. (1998). Crop evapotranspiration — Guidelines for
//    computing crop water requirements. FAO Irrigation and Drainage Paper 56, chapitre 8
//    (https://www.fao.org/4/x0490e/x0490e0e.htm), Tableau 22 (profondeur racinaire Zr et fraction
//    de tarissement p par culture).
//  - NRCS (USDA) Irrigation Guide, valeurs usuelles de réserve utile (Available Water Capacity)
//    par classe texturale, reprises par l'University of Minnesota Extension, « Basics of
//    irrigation scheduling » (https://extension.umn.edu/irrigation/basics-irrigation-scheduling).
// Limite assumée : en l'absence de données pédologiques locales (texture, profil) accessibles via
// les services climatiques utilisés (NASA POWER, Open-Meteo), la texture du sol est choisie par
// l'utilisateur dans une liste de classes texturales usuelles (valeur par défaut : limono-sableux,
// représentative des sols ferrugineux tropicaux dominants dans le Borgou) ; la pluie efficace est
// assimilée à la pluie brute (ruissellement non modélisé, ce qui tend à surestimer légèrement l'eau
// disponible lors des événements pluvieux de forte intensité) ; le profil est supposé à la capacité
// au champ au semis (Dr = 0 à J0).

// ---------- Table des coefficients culturaux (Kc) par culture ----------
// stades : initiale (ini) / développement (dev) / mi-saison (mid) / fin de cycle (fin)
// duree : nombre de jours de chaque stade ; kc : valeur du coefficient cultural au stade
// ---------- Seuil de « jour de pluie » ----------
// Un jour est considéré comme un jour de pluie lorsque la hauteur pluviométrique
// enregistrée est strictement supérieure à ce seuil (mm/jour). Ce seuil sert à la fois
// au comptage des jours de pluie (agrégations par période) et, par complémentarité,
// à la détection des séquences sèches (un jour non pluvieux = pluie ≤ seuil).
export const RAIN_DAY_THRESHOLD_MM = 5;

// ---------- Réserve utile par classe texturale (AWC, mm par mètre de sol) ----------
// Valeurs usuelles (NRCS Irrigation Guide, via UMN Extension) converties de in/ft en mm/m
// (1 in/ft = 83,3 mm/m). Choix indicatif par défaut pour le Borgou : limono-sableux (sols
// ferrugineux tropicaux à horizon de surface sablo-limoneux) — à ajuster selon la texture
// réellement observée sur la parcelle ou le résultat d'une analyse pédologique locale.
export const SOIL_TEXTURE_TABLE = {
  sableux: { label: "Sableux", awcMm: 21 },
  sablo_limoneux: { label: "Sablo-limoneux", awcMm: 71 },
  limono_sableux: { label: "Limono-sableux (défaut Borgou)", awcMm: 121 },
  limoneux: { label: "Limoneux", awcMm: 167 },
  limono_argileux: { label: "Limono-argileux", awcMm: 200 },
  argileux: { label: "Argileux", awcMm: 150 },
};
export const DEFAULT_SOIL_TEXTURE = "limono_sableux";

export const CROP_KC_TABLE = {
  mais: {
    label: "Maïs (cycle moyen)",
    duree: { ini: 20, dev: 35, mid: 40, fin: 15 },
    kc: { ini: 0.30, mid: 1.20, fin: 0.60 },
    zrMax: 1.3, pBase: 0.55, // FAO-56 Tableau 22 : « Maize, Field (grain) », Zr 1,0–1,7 m, p = 0,55
  },
  sorgho: {
    label: "Sorgho",
    duree: { ini: 20, dev: 30, mid: 40, fin: 30 },
    kc: { ini: 0.30, mid: 1.05, fin: 0.55 },
    zrMax: 1.5, pBase: 0.55, // FAO-56 Tableau 22 : « Sorghum - grain », Zr 1,0–2,0 m, p = 0,55
  },
  riz_pluvial: {
    label: "Riz pluvial (non irrigué)",
    duree: { ini: 30, dev: 30, mid: 30, fin: 30 },
    kc: { ini: 1.05, mid: 1.20, fin: 0.75 },
    // FAO-56 Tableau 22 donne Zr 0,5–1,0 m pour le riz, mais p = 0,20 y est explicitement défini
    // « of saturation » pour le riz inondé (submergé en permanence) — non pertinent ici puisqu'il
    // s'agit de riz PLUVIAL non irrigué, cultivé à même le régime de pluie sans lame d'eau
    // maintenue. On retient donc une fraction de tarissement usuelle de céréale pluviale (p = 0,50)
    // plutôt que la valeur « riz irrigué » du tableau, qui sous-estimerait fortement le stress.
    zrMax: 0.75, pBase: 0.50,
  },
  niebe: {
    label: "Niébé (cycle court)",
    duree: { ini: 15, dev: 20, mid: 30, fin: 20 },
    kc: { ini: 0.40, mid: 1.05, fin: 0.55 },
    zrMax: 0.75, pBase: 0.45, // FAO-56 Tableau 22 : « Beans, dry and Pulses », Zr 0,6–0,9 m, p = 0,45
  },
  soja: {
    label: "Soja",
    duree: { ini: 20, dev: 30, mid: 45, fin: 25 },
    kc: { ini: 0.40, mid: 1.15, fin: 0.50 },
    zrMax: 0.95, pBase: 0.50, // FAO-56 Tableau 22 : « Soybeans », Zr 0,6–1,3 m, p = 0,50
  },
  coton: {
    label: "Coton",
    duree: { ini: 30, dev: 50, mid: 60, fin: 30 },
    kc: { ini: 0.35, mid: 1.18, fin: 0.65 },
    zrMax: 1.35, pBase: 0.65, // FAO-56 Tableau 22 : « Cotton », Zr 1,0–1,7 m, p = 0,65
  },
  arachide: {
    label: "Arachide",
    duree: { ini: 25, dev: 35, mid: 45, fin: 25 },
    kc: { ini: 0.40, mid: 1.08, fin: 0.55 },
    zrMax: 0.75, pBase: 0.50, // FAO-56 Tableau 22 : « Groundnut (Peanut) », Zr 0,5–1,0 m, p = 0,50
  },
  manioc: {
    label: "Manioc (cycle long, valeurs indicatives)",
    duree: { ini: 60, dev: 60, mid: 120, fin: 60 },
    kc: { ini: 0.30, mid: 0.90, fin: 0.50 },
    // Le manioc n'est pas répertorié au Tableau 22 de la FAO-56. Zr et p sont estimés à partir de
    // la littérature agronomique sur l'enracinement du manioc (système racinaire principalement
    // concentré entre 0,3 et 1,0 m, plante réputée relativement tolérante au déficit hydrique) —
    // valeurs à recaler par calibration locale si possible.
    zrMax: 0.8, pBase: 0.55,
  },
};

// Coefficient cultural interpolé pour un jour donné (dayIndex = nombre de jours écoulés depuis le semis)
export function kcForDay(crop, dayIndex) {
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
  return null; // hors cycle
}

export function stageForDay(crop, dayIndex) {
  const { duree } = crop;
  const tIni = duree.ini;
  const tDev = tIni + duree.dev;
  const tMid = tDev + duree.mid;
  const tFin = tMid + duree.fin;
  if (dayIndex < 0 || dayIndex > tFin) return null;
  if (dayIndex <= tIni) return "Initiale";
  if (dayIndex <= tDev) return "Développement";
  if (dayIndex <= tMid) return "Mi-saison";
  return "Fin de cycle";
}

export function cropCycleLength(crop) {
  return crop.duree.ini + crop.duree.dev + crop.duree.mid + crop.duree.fin;
}

// Profondeur racinaire effective Zr(t) (m) : croissance linéaire d'une profondeur initiale
// approximative jusqu'à Zr max atteinte en fin de stade de développement, puis constante
// (FAO-56, §8.4 — la profondeur racinaire progresse avec le développement de la culture).
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

// ---------- Bilan hydrique simplifié (séquentiel, sans réserve utile du sol) ----------
// Pour chaque jour : bilan = pluie - ET0 ; bilan cumulé = somme courante (non bornée),
// et bilan cumulé plafonné à 0 en borne basse pour représenter une réserve non négative
// (approche simplifiée à usage de diagnostic, ne remplace pas un bilan hydrique de sol complet).
export function computeWaterBalance(daily) {
  let cumulNonBorne = 0;
  let cumulBorne = 0;
  return daily.map((d) => {
    const bilanJour = (d.pluie ?? 0) - (d.et0 ?? 0);
    cumulNonBorne += bilanJour;
    cumulBorne = Math.max(0, cumulBorne + bilanJour);
    return { ...d, bilanJour, bilanCumule: cumulNonBorne, reserveEstimee: cumulBorne };
  });
}

// ---------- Analyse de la satisfaction des besoins en eau d'une culture ----------
// Découpe le cycle en décades à partir de la date de semis. Pour chaque jour du cycle, calcule
// ETc = Kc × ET0, met à jour le bilan hydrique de la zone racinaire (déplétion Dr, réserve utile
// TAW, réserve facilement utilisable RAW, coefficient de stress Ks) selon la méthode FAO-56
// (Allen et al., 1998, chap. 8, eq. 82-85 — voir l'en-tête du fichier), puis agrège par décade :
// eau disponible en fin de décade (TAW − Dr), Ks moyen, et l'indice de satisfaction (ISE) = P
// décadaire / ETc décadaire à titre d'indicateur complémentaire.
export function computeCropWaterSatisfaction(daily, cropKey, sowingDateISO, textureKey = DEFAULT_SOIL_TEXTURE) {
  const crop = CROP_KC_TABLE[cropKey];
  const texture = SOIL_TEXTURE_TABLE[textureKey] || SOIL_TEXTURE_TABLE[DEFAULT_SOIL_TEXTURE];
  if (!crop || !sowingDateISO) return null;
  const sowing = new Date(sowingDateISO);
  const cycleLength = cropCycleLength(crop);

  const byDate = new Map(daily.map((d) => [d.dateISO, d]));
  const decades = [];
  let current = null;
  let drPrev = 0; // hypothèse : profil à la capacité au champ au semis (Dr = 0 à J0)

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

    // Bilan hydrique de la zone racinaire (FAO-56 eq. 82-85)
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
        dr: 0,
      };
      decades.push(current);
    }
    current.dateFin = dateISO;
    current.nJours += 1;
    current.ksSum += ks;
    // Valeurs de fin de décade (dernière valeur du jour rencontré dans la décade)
    current.taw = taw; current.raw = raw; current.eauDisponible = eauDisponible; current.dr = dr;
    if (pluie !== null) current.pluieCumul += pluie;
    if (etc !== null) current.etcCumul += etc; else current.joursManquants += 1;
  }

  const decadesResult = decades
    .filter((dec) => dec.etcCumul > 0 || dec.pluieCumul > 0)
    .map((dec) => {
      const ise = dec.etcCumul > 0 ? dec.pluieCumul / dec.etcCumul : null;
      const ksMoyen = dec.nJours > 0 ? dec.ksSum / dec.nJours : null;
      let statut = "Données insuffisantes";
      if (ksMoyen !== null && dec.joursManquants < dec.nJours) {
        if (ksMoyen >= 0.9) statut = "Besoins satisfaits";
        else if (ksMoyen >= 0.5) statut = "Stress modéré";
        else statut = "Stress sévère";
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
    periodesStress: decadesResult.filter((d) => d.statut === "Stress modéré" || d.statut === "Stress sévère"),
  };
}

// ---------- Détection des séquences sèches ----------
// Une séquence sèche = suite de jours consécutifs dont la pluviométrie ne dépasse pas le seuil
// de jour de pluie (par défaut RAIN_DAY_THRESHOLD_MM = 5 mm), c'est-à-dire des jours qui ne sont
// pas comptés comme jours de pluie. minLength fixe la longueur à partir de laquelle la séquence
// est agronomiquement significative (par défaut 7 jours consécutifs).
export function detectDrySpells(daily, threshold = RAIN_DAY_THRESHOLD_MM, minLength = 7) {
  const spells = [];
  let run = null;
  daily.forEach((d, i) => {
    const isDry = d.pluie !== null && d.pluie !== undefined && d.pluie <= threshold;
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
    longest: spells.reduce((max, s) => (s.length > (max?.length || 0) ? s : max), null),
    countSignificant: significant.length,
  };
}

// ---------- Agrégation par période (mois / trimestre) ----------
export function aggregateByPeriod(daily, period) {
  const groups = new Map();
  daily.forEach((d) => {
    if (!d.dateISO) return;
    const dt = new Date(d.dateISO);
    const year = dt.getFullYear();
    const month = dt.getMonth(); // 0-11
    const key = period === "mois" ? `${year}-${String(month + 1).padStart(2, "0")}` : `${year}-T${Math.floor(month / 3) + 1}`;
    if (!groups.has(key)) {
      groups.set(key, { key, pluie: 0, et0: 0, tmaxSum: 0, tminSum: 0, n: 0, joursPluie: 0 });
    }
    const g = groups.get(key);
    if (d.pluie !== null && d.pluie !== undefined) { g.pluie += d.pluie; if (d.pluie > RAIN_DAY_THRESHOLD_MM) g.joursPluie += 1; }
    if (d.et0 !== null && d.et0 !== undefined) g.et0 += d.et0;
    if (d.tmax !== null && d.tmax !== undefined) g.tmaxSum += d.tmax;
    if (d.tmin !== null && d.tmin !== undefined) g.tminSum += d.tmin;
    g.n += 1;
  });
  return [...groups.values()]
    .sort((a, b) => (a.key > b.key ? 1 : -1))
    .map((g) => ({
      periode: g.key,
      pluie: g.pluie,
      et0: g.et0,
      tmoyenne: g.n > 0 ? (g.tmaxSum + g.tminSum) / (2 * g.n) : null,
      joursPluie: g.joursPluie,
      n: g.n,
    }));
}
