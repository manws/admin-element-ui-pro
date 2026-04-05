/**
 * 种子随机数生成器
 * 用于可复现的模拟随机
 */

/** 将字符串转为数值种子 */
export function stringToSeed(text: string): number {
  let seed = 0;
  const normalized = String(text || "DEFAULT-SEED");
  for (let i = 0; i < normalized.length; i++) {
    seed = (seed * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return seed || 123456789;
}

/** 创建基于种子的伪随机数生成器 */
export function createSeededRandom(seedText: string): () => number {
  let state = stringToSeed(seedText);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** 数字补零 */
export function padNumber(value: number, length = 3): string {
  return String(value).padStart(length, "0");
}

/** 解析分配比例字符串 */
export function parseRatio(value: string): { ratioA: number; ratioB: number; ratioTotal: number } {
  const [ratioA, ratioB] = value.split(":").map(Number);
  return { ratioA, ratioB, ratioTotal: ratioA + ratioB };
}

/** 校正区组大小使其与分配比例兼容 */
export function normalizeBlockSize(rawSize: number, ratioTotal: number): number {
  const minValid = ratioTotal;
  const safeSize = Math.max(minValid, Math.round(rawSize || minValid));
  if (safeSize % ratioTotal === 0) return safeSize;
  return Math.ceil(safeSize / ratioTotal) * ratioTotal;
}

/** Fisher-Yates 洗牌 */
export function shuffleArray<T>(list: T[], random: () => number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 计算加权差（用于最小化随机） */
export function calculateWeightedGap(countA: number, countB: number, ratioA: number, ratioB: number): number {
  return Math.abs(countA * ratioB - countB * ratioA);
}

/** 限制概率值在有效范围 */
export function clampProbability(value: number, fallback = 0.5): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(0.9, Math.max(0.1, value));
}
