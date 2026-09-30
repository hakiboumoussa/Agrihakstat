import { tTestPValue, chiSquarePValue, fTestPValue, studentTCDF } from "./statsMath.js";

function normalCDF(z) {
  // Approximation d'Abramowitz-Stegun de la fonction d'erreur
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return p;
}

// Somme Σ(t³ - t) sur les groupes de valeurs ex æquo, utilisée par la correction de continuité
// des tests de rangs (Mann-Whitney, Kruskal-Wallis) en présence d'égalités — cf. Conover, W.J.
// (1999), Practical Nonparametric Statistics, 3ᵉ éd., Wiley, p. 288 (Kruskal-Wallis) et p. 313
// (Mann-Whitney). Sans cette correction, la variance de la statistique est surestimée dès que les
// données comportent des ex æquo (échelles de satisfaction, classes de rendement discrètes...),
// ce qui rend le test p-value systématiquement conservateur (p trop élevé).
function tieCorrectionSum(values) {
  const counts = {};
  values.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  return Object.values(counts).reduce((acc, t) => acc + (t ** 3 - t), 0);
}

function rank(values) {
  const idx = values.map((v, i) => i).sort((a, b) => values[a] - values[b]);
  const ranks = new Array(values.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && values[idx[j + 1]] === values[idx[i]]) j++;
    const avgRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[idx[k]] = avgRank;
    i = j + 1;
  }
  return ranks;
}

// ---------- Détection du type d'une colonne ----------
export function detectColumnType(values) {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
  if (nonEmpty.length === 0) return { type: "Vide", isQuantitative: false };
  const numeric = nonEmpty.filter((v) => v !== "" && !isNaN(Number(v)));
  const ratioNumeric = numeric.length / nonEmpty.length;

  if (ratioNumeric > 0.9) {
    const uniqueVals = new Set(numeric.map(Number));
    if (uniqueVals.size <= 8 && numeric.every((v) => Number.isInteger(Number(v)))) {
      return { type: `Quantitative discrète (${uniqueVals.size} valeurs)`, isQuantitative: true };
    }
    return { type: "Quantitative continue", isQuantitative: true };
  }
  const unique = new Set(nonEmpty.map(String));
  if (unique.size <= 12) {
    return { type: `Nominale (${unique.size} modalités)`, isQuantitative: false, modalites: [...unique] };
  }
  return { type: "Texte libre", isQuantitative: false };
}

export function buildColumnsMeta(rows) {
  if (!rows || rows.length === 0) return [];
  const names = Object.keys(rows[0]);
  return names.map((name) => {
    const values = rows.map((r) => r[name]);
    const meta = detectColumnType(values);
    const looksGeo = /lat|lon|latitude|longitude|geo/i.test(name);
    return { name, ...meta, isGeo: looksGeo && meta.isQuantitative };
  });
}

// ---------- Statistiques descriptives ----------
export function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
export function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
export function stdev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - 1));
}
export function numericValues(rows, col) {
  return rows.map((r) => Number(r[col])).filter((v) => !isNaN(v));
}

// Quartile par interpolation linéaire (méthode couramment utilisée, cohérente avec Excel/R type 7)
function quartile(sortedVals, q) {
  const pos = (sortedVals.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedVals[base + 1] !== undefined) {
    return sortedVals[base] + rest * (sortedVals[base + 1] - sortedVals[base]);
  }
  return sortedVals[base];
}

// Détection des valeurs atypiques (outliers) selon la méthode interquartile (IQR) :
// bornes = Q1 - 1.5×IQR et Q3 + 1.5×IQR ; toute valeur hors de cet intervalle est considérée atypique.
export function detectOutliersIQR(vals) {
  if (!vals || vals.length < 4) {
    return { q1: null, q3: null, iqr: null, lowerBound: null, upperBound: null, outliers: [], count: 0 };
  }
  const sorted = [...vals].sort((a, b) => a - b);
  const q1 = quartile(sorted, 0.25);
  const q3 = quartile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = vals.filter((v) => v < lowerBound || v > upperBound);
  return { q1, q3, iqr, lowerBound, upperBound, outliers, count: outliers.length };
}

export function descriptiveStats(rows, col) {
  const vals = numericValues(rows, col);
  const m = mean(vals), sd = stdev(vals);
  return {
    n: vals.length, moyenne: m, mediane: median(vals), ecartType: sd,
    cv: (sd / m) * 100, min: Math.min(...vals), max: Math.max(...vals),
    outliers: detectOutliersIQR(vals),
  };
}

export function frequencies(rows, col) {
  const counts = {};
  rows.forEach((r) => {
    const v = String(r[col] ?? "").trim();
    if (v === "") return;
    counts[v] = (counts[v] || 0) + 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return Object.entries(counts)
    .map(([modalite, n]) => ({ modalite, n, pct: (n / total) * 100 }))
    .sort((a, b) => b.n - a.n);
}

// ---------- Bivariée : corrélation de Spearman (Pearson calculé sur les rangs) ----------
export function spearmanCorrelation(rows, colX, colY) {
  const pairs = rows
    .map((r) => [Number(r[colX]), Number(r[colY])])
    .filter(([x, y]) => !isNaN(x) && !isNaN(y));
  const xs = rank(pairs.map((p) => p[0]));
  const ys = rank(pairs.map((p) => p[1]));
  const n = xs.length;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
  }
  const rho = num / Math.sqrt(dx2 * dy2);
  const df = n - 2;
  const t = rho * Math.sqrt(df / (1 - rho * rho));
  const p = tTestPValue(t, df);
  return { r: rho, n, df, t, p };
}

// ---------- Bivariée : test de Mann-Whitney (variable quantitative × qualitative à 2 modalités) ----------
export function mannWhitneyU(rows, quantCol, qualCol) {
  const groups = {};
  rows.forEach((r) => {
    const g = String(r[qualCol] ?? "").trim();
    const v = Number(r[quantCol]);
    if (g === "" || isNaN(v)) return;
    if (!groups[g]) groups[g] = [];
    groups[g].push(v);
  });
  const [g1, g2] = Object.keys(groups);
  const n1 = groups[g1].length, n2 = groups[g2].length;
  const combined = [...groups[g1].map((v) => ({ v, g: 1 })), ...groups[g2].map((v) => ({ v, g: 2 }))];
  const ranks = rank(combined.map((c) => c.v));
  let R1 = 0;
  combined.forEach((c, i) => { if (c.g === 1) R1 += ranks[i]; });
  const U1 = R1 - (n1 * (n1 + 1)) / 2;
  const U2 = n1 * n2 - U1;
  const U = Math.min(U1, U2);
  const mU = (n1 * n2) / 2;
  // Correction pour ex æquo (Conover, 1999, p.313) : sans elle, la variance de U est surestimée
  // dès que des valeurs sont liées (ranks moyennés), ce qui rend le test conservateur.
  const N = n1 + n2;
  const tieCorr = tieCorrectionSum(combined.map((c) => c.v));
  const varAdjust = N > 1 ? (N + 1) - tieCorr / (N * (N - 1)) : N + 1;
  const sigmaU = Math.sqrt((n1 * n2 / 12) * Math.max(varAdjust, 0));
  const z = sigmaU > 0 ? (U - mU) / sigmaU : 0;
  const p = 2 * (1 - normalCDF(Math.abs(z)));
  return { U, z, p, n1, n2, groupes: [g1, g2] };
}

// ---------- Bivariée : test de Kruskal-Wallis (variable quantitative × qualitative à 3+ modalités) ----------
export function kruskalWallis(rows, quantCol, qualCol) {
  const groups = {};
  rows.forEach((r) => {
    const g = String(r[qualCol] ?? "").trim();
    const v = Number(r[quantCol]);
    if (g === "" || isNaN(v)) return;
    if (!groups[g]) groups[g] = [];
    groups[g].push(v);
  });
  const groupNames = Object.keys(groups);
  const all = groupNames.flatMap((g) => groups[g].map((v) => ({ v, g })));
  const ranks = rank(all.map((a) => a.v));
  const N = all.length, k = groupNames.length;
  const rankSums = {};
  all.forEach((a, i) => { rankSums[a.g] = (rankSums[a.g] || 0) + ranks[i]; });
  let H = 0;
  groupNames.forEach((g) => { H += (rankSums[g] ** 2) / groups[g].length; });
  H = (12 / (N * (N + 1))) * H - 3 * (N + 1);
  // Correction pour ex æquo (Conover, 1999, p.288) : divise H par (1 − ΣΣ(t³−t) / (N³−N)) pour
  // compenser la sous-dispersion des rangs induite par les valeurs liées (échelles discrètes,
  // classes de rendement...). Sans elle, la statistique H est sous-estimée et p artificiellement élevé.
  const tieCorr = tieCorrectionSum(all.map((a) => a.v));
  const correctionFactor = N > 1 ? 1 - tieCorr / (N ** 3 - N) : 1;
  if (correctionFactor > 0 && correctionFactor < 1) H = H / correctionFactor;
  const df = k - 1;
  const p = chiSquarePValue(H, df);
  return { H, df, p, N, k };
}

// ---------- Bivariée : corrélation (Pearson) ----------
export function pearsonCorrelation(rows, colX, colY) {
  const pairs = rows
    .map((r) => [Number(r[colX]), Number(r[colY])])
    .filter(([x, y]) => !isNaN(x) && !isNaN(y));
  const n = pairs.length;
  const xs = pairs.map((p) => p[0]), ys = pairs.map((p) => p[1]);
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
  }
  const r = num / Math.sqrt(dx2 * dy2);
  const df = n - 2;
  const t = r * Math.sqrt(df / (1 - r * r));
  const p = tTestPValue(t, df);
  return { r, n, df, t, p };
}

// ---------- Bivariée : ANOVA à un facteur (variable quantitative × qualitative) ----------
export function oneWayAnova(rows, quantCol, qualCol) {
  const groups = {};
  rows.forEach((r) => {
    const g = String(r[qualCol] ?? "").trim();
    const v = Number(r[quantCol]);
    if (g === "" || isNaN(v)) return;
    if (!groups[g]) groups[g] = [];
    groups[g].push(v);
  });
  const groupNames = Object.keys(groups);
  const allVals = groupNames.flatMap((g) => groups[g]);
  const grandMean = mean(allVals);
  const k = groupNames.length;
  const N = allVals.length;

  let ssBetween = 0, ssWithin = 0;
  const groupStats = groupNames.map((g) => {
    const vals = groups[g];
    const m = mean(vals);
    ssBetween += vals.length * (m - grandMean) ** 2;
    vals.forEach((v) => { ssWithin += (v - m) ** 2; });
    return { groupe: g, n: vals.length, moyenne: m, ecartType: vals.length > 1 ? stdev(vals) : 0 };
  });

  const dfBetween = k - 1, dfWithin = N - k;
  const msBetween = ssBetween / dfBetween, msWithin = ssWithin / dfWithin;
  const F = msBetween / msWithin;
  const p = fTestPValue(F, dfBetween, dfWithin);
  const etaSq = ssBetween / (ssBetween + ssWithin);

  return { groupStats, F, dfBetween, dfWithin, p, etaSq, N, k };
}

// ---------- Bivariée : Khi² d'indépendance (deux variables qualitatives) ----------
export function chiSquareTest(rows, colX, colY) {
  const table = {};
  const xCats = new Set(), yCats = new Set();
  rows.forEach((r) => {
    const x = String(r[colX] ?? "").trim(), y = String(r[colY] ?? "").trim();
    if (x === "" || y === "") return;
    xCats.add(x); yCats.add(y);
    table[x] = table[x] || {};
    table[x][y] = (table[x][y] || 0) + 1;
  });
  const xList = [...xCats], yList = [...yCats];
  const rowTotals = {}, colTotals = {};
  let grandTotal = 0;
  xList.forEach((x) => {
    rowTotals[x] = yList.reduce((s, y) => s + (table[x]?.[y] || 0), 0);
    grandTotal += rowTotals[x];
  });
  yList.forEach((y) => {
    colTotals[y] = xList.reduce((s, x) => s + (table[x]?.[y] || 0), 0);
  });

  let chi2 = 0, cellsBelow5 = 0, totalCells = 0;
  xList.forEach((x) => {
    yList.forEach((y) => {
      const observed = table[x]?.[y] || 0;
      const expected = (rowTotals[x] * colTotals[y]) / grandTotal;
      totalCells++;
      if (expected < 5) cellsBelow5++;
      if (expected > 0) chi2 += (observed - expected) ** 2 / expected;
    });
  });
  const df = (xList.length - 1) * (yList.length - 1);
  const p = chiSquarePValue(chi2, df);
  const cramersV = Math.sqrt(chi2 / (grandTotal * (Math.min(xList.length, yList.length) - 1)));

  return { chi2, df, p, cramersV, n: grandTotal, pctCellsBelow5: (cellsBelow5 / totalCells) * 100, table, xList, yList, rowTotals, colTotals };
}

// Test de Levene simplifié (Brown-Forsythe) : ANOVA sur les écarts absolus à la médiane de chaque groupe
export function leveneTest(rows, quantCol, qualCol) {
  const groups = {};
  rows.forEach((r) => {
    const g = String(r[qualCol] ?? "").trim();
    const v = Number(r[quantCol]);
    if (g === "" || isNaN(v)) return;
    if (!groups[g]) groups[g] = [];
    groups[g].push(v);
  });
  const derivedRows = [];
  Object.entries(groups).forEach(([g, vals]) => {
    const med = median(vals);
    vals.forEach((v) => derivedRows.push({ [qualCol]: g, __abs_dev: Math.abs(v - med) }));
  });
  return oneWayAnova(derivedRows, "__abs_dev", qualCol);
}

// Test de normalité simplifié (asymétrie) — indicatif, pas un Shapiro-Wilk complet
export function normalityHint(vals) {
  const m = mean(vals), sd = stdev(vals);
  const n = vals.length;
  const skew = vals.reduce((a, b) => a + ((b - m) / sd) ** 3, 0) / n;
  const looksNormal = Math.abs(skew) < 1;
  return { skew, looksNormal };
}
