// Fonctions mathématiques pour tests statistiques réels (implémentation standard,
// basée sur les algorithmes classiques de fonction gamma/bêta incomplètes).

function gammln(x) {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) { y += 1; ser += cof[j] / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betacf(a, b, x) {
  const MAXIT = 200, EPS = 3e-9, FPMIN = 1e-30;
  let qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
  return 1 - bt * betacf(b, a, 1 - x) / b;
}

function gammpSeries(a, x) {
  const ITMAX = 200, EPS = 3e-9;
  if (x <= 0) return 0;
  let ap = a, sum = 1 / a, del = sum;
  for (let n = 1; n <= ITMAX; n++) {
    ap += 1; del *= x / ap; sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - gammln(a));
}

function gammpCF(a, x) {
  const ITMAX = 200, EPS = 3e-9, FPMIN = 1e-30;
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - gammln(a)) * h;
}

function gammap(a, x) {
  if (x < a + 1) return gammpSeries(a, x);
  return 1 - gammpCF(a, x);
}

export function studentTCDF(t, df) {
  const x = df / (df + t * t);
  const p = betai(df / 2, 0.5, x);
  return t > 0 ? 1 - p / 2 : p / 2;
}

export function chiSquareCDF(x, df) {
  return gammap(df / 2, x / 2);
}

export function fCDF(f, df1, df2) {
  const x = df1 * f / (df1 * f + df2);
  return betai(df1 / 2, df2 / 2, x);
}

export function tTestPValue(t, df) { const p = studentTCDF(Math.abs(t), df); return 2 * (1 - p); }
export function chiSquarePValue(x, df) { return 1 - chiSquareCDF(x, df); }
export function fTestPValue(f, df1, df2) { return 1 - fCDF(f, df1, df2); }
