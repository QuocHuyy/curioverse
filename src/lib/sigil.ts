/**
 * "Chòm sao riêng" cho mỗi bài: sinh ngẫu nhiên nhưng cố định theo slug,
 * nên cùng một bài luôn có cùng một hình.
 */

/** FNV-1a 32-bit */
export function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** PRNG nhỏ, đủ tốt cho mục đích trang trí. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SigilStar {
  x: number;
  y: number;
  r: number;
  bright: boolean;
}
export interface Sigil {
  stars: SigilStar[];
  lines: [number, number][];
}

/** Toạ độ trong khoảng [0, 100]. */
export function makeSigil(seed: string, opts: { min?: number; max?: number; pad?: number } = {}): Sigil {
  const { min = 5, max = 8, pad = 12 } = opts;
  const rand = mulberry32(hash(seed));
  const n = min + Math.floor(rand() * (max - min + 1));
  const stars: SigilStar[] = [];
  const minDist = 17;
  let guard = 0;
  while (stars.length < n && guard++ < 600) {
    const x = pad + rand() * (100 - 2 * pad);
    const y = pad + rand() * (100 - 2 * pad);
    if (stars.every((s) => Math.hypot(s.x - x, s.y - y) >= minDist)) {
      stars.push({ x, y, r: 1.1 + rand() * 1.5, bright: false });
    }
  }
  // Ngôi sao sáng nhất
  const brightest = Math.floor(rand() * stars.length);
  if (stars[brightest]) {
    stars[brightest].bright = true;
    stars[brightest].r = 3.2;
  }

  // Cây khung nhỏ nhất (Prim) để nối các sao thành chòm
  const lines: [number, number][] = [];
  const inTree = new Set<number>([0]);
  const d = (i: number, j: number) => Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
  while (inTree.size < stars.length) {
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (const i of inTree) {
      for (let j = 0; j < stars.length; j++) {
        if (inTree.has(j)) continue;
        const dist = d(i, j);
        if (dist < bestD) {
          bestD = dist;
          best = [i, j];
        }
      }
    }
    if (!best) break;
    lines.push(best);
    inTree.add(best[1]);
  }
  // Thỉnh thoảng thêm một đường khép vòng cho đẹp
  if (stars.length > 4 && rand() < 0.4) {
    const has = (i: number, j: number) => lines.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (let i = 0; i < stars.length; i++)
      for (let j = i + 1; j < stars.length; j++)
        if (!has(i, j) && d(i, j) < bestD) {
          bestD = d(i, j);
          best = [i, j];
        }
    if (best) lines.push(best);
  }
  return { stars, lines };
}

/** Đường path của ngôi sao 4 cánh, tâm (cx, cy), bán kính r. */
export function sparklePath(cx: number, cy: number, r: number, waist = 0.22): string {
  const w = r * waist;
  return [
    `M${cx} ${cy - r}`,
    `C${cx + w} ${cy - w} ${cx + w} ${cy - w} ${cx + r} ${cy}`,
    `C${cx + w} ${cy + w} ${cx + w} ${cy + w} ${cx} ${cy + r}`,
    `C${cx - w} ${cy + w} ${cx - w} ${cy + w} ${cx - r} ${cy}`,
    `C${cx - w} ${cy - w} ${cx - w} ${cy - w} ${cx} ${cy - r}`,
    'Z',
  ].join(' ');
}

/** Bầu trời nền: các chấm sao nhỏ ngẫu nhiên (cố định theo seed). */
export function starfield(seed: string, count: number, w = 100, h = 100) {
  const rand = mulberry32(hash(seed));
  return Array.from({ length: count }, () => ({
    x: +(rand() * w).toFixed(2),
    y: +(rand() * h).toFixed(2),
    r: +(0.15 + rand() * rand() * 0.9).toFixed(2),
    o: +(0.25 + rand() * 0.6).toFixed(2),
    d: +(rand() * 6).toFixed(2),
  }));
}
