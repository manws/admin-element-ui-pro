/**
 * 基本统计工具函数
 */

/** 求和 */
export function sum(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0);
}

/** 均值 */
export function mean(arr: number[]): number {
  return arr.length ? sum(arr) / arr.length : 0;
}

/** 方差（样本方差，n-1） */
export function variance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return sum(arr.map((v) => (v - m) ** 2)) / (arr.length - 1);
}

/** 标准差 */
export function stdDev(arr: number[]): number {
  return Math.sqrt(variance(arr));
}

/** 标准误 */
export function stdError(arr: number[]): number {
  return arr.length ? stdDev(arr) / Math.sqrt(arr.length) : 0;
}

/** 排序后的数组 */
export function sorted(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

/** 中位数 */
export function median(arr: number[]): number {
  const s = sorted(arr);
  const n = s.length;
  if (n === 0) return 0;
  return n % 2 === 1 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** 分位数（线性插值） */
export function quantile(arr: number[], p: number): number {
  const s = sorted(arr);
  const n = s.length;
  if (n === 0) return 0;
  if (p <= 0) return s[0];
  if (p >= 1) return s[n - 1];
  const idx = p * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

/** 偏度（样本偏度） */
export function skewness(arr: number[]): number {
  const n = arr.length;
  if (n < 3) return 0;
  const m = mean(arr);
  const sd = stdDev(arr);
  if (sd === 0) return 0;
  const m3 = sum(arr.map((v) => ((v - m) / sd) ** 3)) / n;
  return (n * (n - 1)) ** 0.5 / (n - 2) * m3 * n / (n - 1);
}

/** 峰度（超额峰度） */
export function kurtosis(arr: number[]): number {
  const n = arr.length;
  if (n < 4) return 0;
  const m = mean(arr);
  const sd = stdDev(arr);
  if (sd === 0) return 0;
  const m4 = sum(arr.map((v) => ((v - m) / sd) ** 4)) / n;
  return ((n + 1) * n * m4 / ((n - 1) * (n - 2) * (n - 3))) * (n - 1) - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3));
}

/** 最小值 */
export function min(arr: number[]): number {
  return arr.length ? Math.min(...arr) : 0;
}

/** 最大值 */
export function max(arr: number[]): number {
  return arr.length ? Math.max(...arr) : 0;
}

/** 极差 */
export function range(arr: number[]): number {
  return max(arr) - min(arr);
}

/** 变异系数 CV (%) */
export function cv(arr: number[]): number {
  const m = mean(arr);
  return m !== 0 ? (stdDev(arr) / Math.abs(m)) * 100 : 0;
}

/** 几何平均数 */
export function geometricMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  if (arr.some((v) => v <= 0)) return NaN;
  const logSum = arr.reduce((s, v) => s + Math.log(v), 0);
  return Math.exp(logSum / arr.length);
}

/** 调和平均数 */
export function harmonicMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  if (arr.some((v) => v === 0)) return NaN;
  const recipSum = arr.reduce((s, v) => s + 1 / v, 0);
  return arr.length / recipSum;
}

/** 截尾均值（默认两端各去 5%） */
export function trimmedMean(arr: number[], proportion = 0.05): number {
  const s = sorted(arr);
  const n = s.length;
  const cut = Math.floor(n * proportion);
  const trimmed = s.slice(cut, n - cut);
  return trimmed.length > 0 ? mean(trimmed) : mean(arr);
}

/** 均值 95% CI（基于 t 分布近似） */
export function meanCI(arr: number[], alpha = 0.05): { lower: number; upper: number } {
  const n = arr.length;
  if (n < 2) return { lower: NaN, upper: NaN };
  const m = mean(arr);
  const se = stdError(arr);
  // 使用正态近似，n 较大时 t 分布接近正态
  const z = normInv(1 - alpha / 2);
  return { lower: m - z * se, upper: m + z * se };
}

/** 偏度系数 Z 检验（偏度/标准误） */
export function skewnessZTest(arr: number[]): { skew: number; se: number; z: number; p: number } {
  const n = arr.length;
  const sk = skewness(arr);
  // 偏度系数的标准误 SE_sk = sqrt(6/n) (简化公式)
  const seSk = Math.sqrt(6 * (n - 1) / ((n + 1) * (n + 3)));
  const z = sk / seSk;
  const p = 2 * (1 - normCDF(Math.abs(z)));
  return { skew: sk, se: seSk, z, p };
}

/** 峰度系数 Z 检验 */
export function kurtosisZTest(arr: number[]): { kurt: number; se: number; z: number; p: number } {
  const n = arr.length;
  const ku = kurtosis(arr);
  // 峰度系数的标准误 SE_ku = sqrt(24/n) (简化公式)
  const seKu = Math.sqrt(24 * n * (n - 1) * (n - 1) / ((n - 2) * (n - 3) * (n + 3) * (n + 5)));
  const z = ku / seKu;
  const p = 2 * (1 - normCDF(Math.abs(z)));
  return { kurt: ku, se: seKu, z, p };
}

/** 格式化 P 值：极小值显示 < 0.0001 */
export function fmtP(p: number): string {
  if (!Number.isFinite(p)) return "-";
  if (p < 0.0001) return "< 0.0001";
  return p.toFixed(4);
}

// ===== 正态分布 =====

/** 标准正态分布 PDF */
export function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** 标准正态分布 CDF（近似） */
export function normCDF(x: number): number {
  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * ax);
  return 0.5 * (1 + s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax)));
}

/** 标准正态分布逆函数（近似） */
export function normInv(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969, a4 = 138.357751867269;
  const b1 = -55.8523268975479, b2 = 148.144926055571, b3 = -133.425630379764, b4 = 51.5246332174095;
  const c1 = -7.78489400243029e-3, c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373;
  const d2 = 0.32246712907004, d3 = 2.445134137143;
  const q = p - 0.5;
  let r: number, x: number;
  if (Math.abs(q) <= 0.425) {
    r = q * q;
    x = q * (((a4 * r + a3) * r + a2) * r + a1) / ((((b4 * r + b3) * r + b2) * r + b1) * r + 1);
  } else {
    r = p < 0.5 ? p : 1 - p;
    r = Math.sqrt(-2 * Math.log(r));
    x = (((c4 * r + c3) * r + c2) * r + c1) / ((d3 * r + d2) * r + 1);
    if (p < 0.5) x = -x;
  }
  return x;
}

// ===== 二项分布 =====

/** 组合数 C(n,k) */
export function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

/** 二项分布 PMF: P(X=k) */
export function binomPMF(k: number, n: number, p: number): number {
  return comb(n, k) * p ** k * (1 - p) ** (n - k);
}

/** 二项分布 CDF: P(X<=k) */
export function binomCDF(k: number, n: number, p: number): number {
  let s = 0;
  for (let i = 0; i <= Math.min(k, n); i++) s += binomPMF(i, n, p);
  return Math.min(s, 1);
}

// ===== Poisson 分布 =====

/** Poisson PMF: P(X=k) */
export function poissonPMF(k: number, mu: number): number {
  if (mu <= 0 || k < 0) return 0;
  let logP = -mu + k * Math.log(mu);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

/** Poisson CDF: P(X<=k) */
export function poissonCDF(k: number, mu: number): number {
  let s = 0;
  for (let i = 0; i <= k; i++) s += poissonPMF(i, mu);
  return Math.min(s, 1);
}

// ===== 卡方分布 =====

/** 不完全 Gamma 函数（正则化下不完全 gamma，用于卡方 P 值） */
function lowerIncompleteGamma(a: number, x: number): number {
  if (x < 0) return 0;
  if (x === 0) return 0;
  // 级数展开法
  let sum = 0, term = 1 / a;
  sum = term;
  for (let n = 1; n < 200; n++) {
    term *= x / (a + n);
    sum += term;
    if (Math.abs(term) < 1e-12 * Math.abs(sum)) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
}

/** ln(Gamma(x)) — Stirling 近似 */
function lnGamma(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/** 卡方分布 P 值: P(χ² ≥ chi2 | df) */
export function chiSquarePValue(chi2: number, df: number): number {
  if (chi2 <= 0 || df <= 0) return 1;
  return 1 - lowerIncompleteGamma(df / 2, chi2 / 2);
}

/** 卡方分布 CDF: P(χ² ≤ x | df) */
export function chiSquareCDF(x: number, df: number): number {
  if (x <= 0 || df <= 0) return 0;
  return lowerIncompleteGamma(df / 2, x / 2);
}

/** 卡方分布逆函数 (二分搜索)：给定 p = P(χ² ≤ x | df)，求 x */
export function chiSquareInv(p: number, df: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  // 初始猜测
  let lo = 0, hi = df + 10 * Math.sqrt(2 * df);
  // 扩大上界直到包含
  while (chiSquareCDF(hi, df) < p) hi *= 2;
  // 二分法
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (chiSquareCDF(mid, df) < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-10) break;
  }
  return (lo + hi) / 2;
}

// ===== t 分布 =====

/** 不完全 Beta 函数（正则化） */
function regularizedBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // 连分式展开
  const maxIter = 200;
  const eps = 1e-12;
  const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta);
  let f = 1, c = 1, d = 0;
  for (let i = 0; i <= maxIter; i++) {
    let m = i, num: number;
    if (i === 0) { num = 1; }
    else if (i % 2 === 0) { m = i / 2; num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m)); }
    else { m = (i - 1) / 2; num = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1)); }
    d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
    c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    f *= d * c;
    if (Math.abs(d * c - 1) < eps) break;
  }
  return front * (f - 1) / a;
}

/** t 分布 P 值 (双侧): P(|T| ≥ |t| | df) */
export function tTestPValue(t: number, df: number): number {
  if (df <= 0) return 1;
  const x = df / (df + t * t);
  return regularizedBeta(x, df / 2, 0.5);
}

/** t 分布 P 值 (单侧): P(T ≥ t | df) */
export function tTestPValueOneSided(t: number, df: number): number {
  return tTestPValue(t, df) / 2;
}

// ===== F 分布 =====

/** F 分布 P 值: P(F ≥ f | df1, df2) */
export function fTestPValue(f: number, df1: number, df2: number): number {
  if (f <= 0 || df1 <= 0 || df2 <= 0) return 1;
  const x = df2 / (df2 + df1 * f);
  return regularizedBeta(x, df2 / 2, df1 / 2);
}

// ===== 秩次计算 =====

/** 计算秩次（处理结） */
export function ranks(arr: number[]): number[] {
  const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const r = new Array(arr.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j].v === indexed[i].v) j++;
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) r[indexed[k].i] = avgRank;
    i = j;
  }
  return r;
}

// ===== 相关系数 =====

/** Pearson 相关系数 */
export function pearsonR(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const mx = mean(x.slice(0, n)), my = mean(y.slice(0, n));
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
}

/** Spearman 秩相关系数 */
export function spearmanR(x: number[], y: number[]): number {
  return pearsonR(ranks(x), ranks(y));
}

/** Kendall τ-b */
export function kendallTau(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  let concordant = 0, discordant = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = x[i] - x[j], dy = y[i] - y[j];
      if (dx * dy > 0) concordant++;
      else if (dx * dy < 0) discordant++;
    }
  }
  const total = concordant + discordant;
  return total > 0 ? (concordant - discordant) / total : 0;
}

/** 阶乘 (用于 Fisher) */
export function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** ln(阶乘) — 避免大数溢出 */
export function lnFactorial(n: number): number {
  if (n <= 1) return 0;
  return lnGamma(n + 1);
}

/** Fisher 精确检验 (2×2 表，双侧) */
export function fisherExact(a: number, b: number, c: number, d: number): { pExact: number; pTwoSided: number } {
  const n = a + b + c + d;
  const r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d;

  function hypergeomPMF(x: number): number {
    return Math.exp(lnFactorial(r1) + lnFactorial(r2) + lnFactorial(c1) + lnFactorial(c2) - lnFactorial(n) - lnFactorial(x) - lnFactorial(r1 - x) - lnFactorial(c1 - x) - lnFactorial(r2 - c1 + x));
  }

  const pObs = hypergeomPMF(a);
  let pTwoSided = 0;
  const minA = Math.max(0, c1 - r2);
  const maxA = Math.min(r1, c1);
  for (let x = minA; x <= maxA; x++) {
    const px = hypergeomPMF(x);
    if (px <= pObs + 1e-12) pTwoSided += px;
  }

  return { pExact: pObs, pTwoSided: Math.min(pTwoSided, 1) };
}

/** 格式化数字 */
export function fmt(v: number, d = 4): string {
  return Number.isFinite(v) ? v.toFixed(d) : "-";
}

/** 解析文本为数字数组 */
export function parseNumbers(text: string): number[] {
  return text
    .replace(/[，、；\n\r\t]+/g, ",")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((v) => Number.isFinite(v));
}
