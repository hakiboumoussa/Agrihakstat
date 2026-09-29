// Module de calculs agroclimatiques : bilan hydrique simplifié, satisfaction des besoins en eau
// par culture (méthode des coefficients culturaux Kc, FAO Irrigation and Drainage Paper n°56,
// Allen et al., 1998) et détection des séquences sèches / périodes de stress hydrique.
// Toutes les valeurs de Kc et de durée de stade sont des valeurs indicatives pour la zone
// soudano-guinéenne (Bénin) — à ajuster selon la variété, la date réelle de semis et la conduite
// culturale observées sur le terrain.

// ---------- Table des coefficients culturaux (Kc) par culture ----------
// stades : initiale (ini) / développement (dev) / mi-saison (mid) / fin de cycle (fin)
// duree : nombre de jours de chaque stade ; kc : valeur du coefficient cultural au stade
export const CROP_KC_TABLE = {
  mais: {
    label: "Maïs (cycle moyen)",
    duree: { ini: 20, dev: 35, mid: 40, fin: 15 },
    kc: { ini: 0.30, mid: 1.20, fin: 0.60 },
  },
  sorgho: {
    label: "Sorgho",
    duree: { ini: 20, dev: 30, mid: 40, fin: 30 },
    kc: { ini: 0.30, mid: 1.05, fin: 0.55 },
  },
  riz_pluvial: {
    label: "Riz pluvial (non irrigué)",
    duree: { ini: 30, dev: 30, mid: 30, fin: 30 },
    kc: { ini: 1.05, mid: 1.20, fin: 0.75 },
  },
  niebe: {
    label: "Niébé (cycle court)",
    duree: { ini: 15, dev: 20, mid: 30, fin: 20 },
    kc: { ini: 0.40, mid: 1.05, fin: 0.55 },
  },
  soja: {
    label: "Soja",
    duree: { ini: 20, dev: 30, mid: 45, fin: 25 },
    kc: { ini: 0.40, mid: 1.15, fin: 0.50 },
  },
  coton: {
    label: "Coton",
    duree: { ini: 30, dev: 50, mid: 60, fin: 30 },
    kc: { ini: 0.35, mid: 1.18, fin: 0.65 },
  },
  arachide: {
    label: "Arachide",
    duree: { ini: 25, dev: 35, mid: 45, fin: 25 },
    kc: { ini: 0.40, mid: 1.08, fin: 0.55 },
  },
  manioc: {
    label: "Manioc (cycle long, valeurs indicatives)",
    duree: { ini: 60, dev: 60, mid: 120, fin: 60 },
    kc: { ini: 0.30, mid: 0.90, fin: 0.50 },
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
// Découpe le cycle en décades à partir de la date de semis, calcule ETc = Kc × ET0 et
// l'indice de satisfaction (ISE) = P décadaire / ETc décadaire.
export function computeCropWaterSatisfaction(daily, cropKey, sowingDateISO) {
  const crop = CROP_KC_TABLE[cropKey];
  if (!crop || !sowingDateISO) return null;
  const sowing = new Date(sowingDateISO);
  const cycleLength = cropCycleLength(crop);

  const byDate = new Map(daily.map((d) => [d.dateISO, d]));
  const decades = [];
  let current = null;

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
      };
      decades.push(current);
    }
    current.dateFin = dateISO;
    current.nJours += 1;
    if (pluie !== null) current.pluieCumul += pluie;
    if (etc !== null) current.etcCumul += etc; else current.joursManquants += 1;
  }

  const decadesResult = decades
    .filter((dec) => dec.etcCumul > 0 || dec.pluieCumul > 0)
    .map((dec) => {
      const ise = dec.etcCumul > 0 ? dec.pluieCumul / dec.etcCumul : null;
      let statut = "Données insuffisantes";
      if (ise !== null) {
        if (ise >= 1) statut = "Besoins satisfaits";
        else if (ise >= 0.5) statut = "Stress modéré";
        else statut = "Stress sévère";
      }
      return { ...dec, ise, statut };
    });

  const totalEtc = decadesResult.reduce((s, d) => s + (d.etcCumul || 0), 0);
  const totalPluie = decadesResult.reduce((s, d) => s + (d.pluieCumul || 0), 0);
  const dateFinCycle = new Date(sowing);
  dateFinCycle.setDate(dateFinCycle.getDate() + cycleLength);

  return {
    crop: crop.label,
    cycleLength,
    sowingDateISO,
    dateFinCycleISO: dateFinCycle.toISOString().slice(0, 10),
    decades: decadesResult,
    totalEtc,
    totalPluie,
    iseGlobal: totalEtc > 0 ? totalPluie / totalEtc : null,
    periodesStress: decadesResult.filter((d) => d.ise !== null && d.ise < 1),
  };
}

// ---------- Détection des séquences sèches ----------
// Une séquence sèche = suite de jours consécutifs dont la pluviométrie est inférieure au seuil
// (par défaut 1 mm, seuil usuel de « jour sans pluie utile »). minLength fixe la longueur à partir
// de laquelle la séquence est agronomiquement significative (par défaut 7 jours consécutifs).
export function detectDrySpells(daily, threshold = 1, minLength = 7) {
  const spells = [];
  let run = null;
  daily.forEach((d, i) => {
    const isDry = d.pluie !== null && d.pluie !== undefined && d.pluie < threshold;
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
    if (d.pluie !== null && d.pluie !== undefined) { g.pluie += d.pluie; if (d.pluie >= 1) g.joursPluie += 1; }
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
