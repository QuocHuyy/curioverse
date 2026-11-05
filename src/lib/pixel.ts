/**
 * Công cụ vẽ pixel art bằng SVG: mọi hình đều là các ô vuông trên lưới,
 * gộp thành một <path> duy nhất cho mỗi màu (nhẹ và sắc nét).
 */

export type Cell = [number, number];

const n = (v: number) => +v.toFixed(3);

/** Gộp các ô (x, y) thành path, mỗi ô cạnh `size`, gốc lưới tại (ox, oy). */
export function cellsPath(cells: Iterable<Cell>, size = 1, ox = 0, oy = 0): string {
  // gom theo hàng rồi gộp các ô liền nhau thành một đoạn
  const rows = new Map<number, number[]>();
  for (const [x, y] of cells) {
    const r = rows.get(y);
    if (r) r.push(x);
    else rows.set(y, [x]);
  }
  let d = '';
  for (const [y, xs] of rows) {
    const sorted = [...new Set(xs)].sort((a, b) => a - b);
    let start = sorted[0];
    let prev = sorted[0];
    const flush = () => {
      d += `M${n(ox + start * size)} ${n(oy + y * size)}h${n((prev - start + 1) * size)}v${n(size)}h${n(-(prev - start + 1) * size)}z`;
    };
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 1) prev = sorted[i];
      else {
        flush();
        start = prev = sorted[i];
      }
    }
    flush();
  }
  return d;
}

/** Ảnh bitmap dạng chuỗi ('#' là ô tô màu) → path. */
export function bitmapPath(rows: readonly string[], on = '#', size = 1, ox = 0, oy = 0): string {
  const cells: Cell[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === on) cells.push([x, y]);
  });
  return cellsPath(cells, size, ox, oy);
}

/** Sprite nhiều màu: mỗi ký tự trong `palette` là một lớp màu. */
export function spriteLayers(rows: readonly string[], palette: Record<string, string>) {
  return Object.entries(palette)
    .map(([ch, fill]) => ({ ch, fill, d: bitmapPath(rows, ch) }))
    .filter((l) => l.d);
}

/** Lật ngang một bitmap. */
export const mirrorX = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(''));
/** Xoay bitmap 90° ngược chiều kim đồng hồ. */
export function rotateCCW(rows: readonly string[]): string[] {
  const h = rows.length;
  const w = rows[0].length;
  return Array.from({ length: w }, (_, y) => Array.from({ length: h }, (_, x) => rows[x][w - 1 - y]).join(''));
}

/** Đường thẳng Bresenham giữa hai ô lưới. */
export function bresenham(x0: number, y0: number, x1: number, y1: number): Cell[] {
  const cells: Cell[] = [];
  let x = Math.round(x0);
  let y = Math.round(y0);
  const tx = Math.round(x1);
  const ty = Math.round(y1);
  const dx = Math.abs(tx - x);
  const dy = -Math.abs(ty - y);
  const sx = x < tx ? 1 : -1;
  const sy = y < ty ? 1 : -1;
  let err = dx + dy;
  for (let guard = 0; guard < 4096; guard++) {
    cells.push([x, y]);
    if (x === tx && y === ty) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return cells;
}

/**
 * Ngôi sao lấp lánh 4 cánh kiểu pixel (tâm tại ô cx, cy).
 * `arm`: độ dài cánh (ô), `core`: độ dày phần thân.
 *   arm 3, core 1:      arm 2, core 1:
 *   ...#...             ..#..
 *   ...#...             .###.
 *   ..###..             #####
 *   #######             .###.
 *   ..###..             ..#..
 *   ...#...
 *   ...#...
 */
export function sparkleCells(cx: number, cy: number, arm = 3, core = 1): Cell[] {
  const cells: Cell[] = [];
  for (let dy = -arm; dy <= arm; dy++) {
    const a = Math.abs(dy);
    const hw = a === 0 ? arm : a <= core ? core - a + 1 : 0;
    for (let dx = -hw; dx <= hw; dx++) cells.push([cx + dx, cy + dy]);
  }
  return cells;
}

/** Path ngôi sao pixel trong toạ độ thật: tâm (x, y), bán kính r, cạnh ô `cell`. */
export function pixelSparklePath(x: number, y: number, r: number, cell?: number): string {
  const size = cell ?? Math.max(r / 3.5, 0.5);
  const arm = Math.max(1, Math.round(r / size));
  const core = arm >= 4 ? 2 : 1;
  const ox = x - size / 2;
  const oy = y - size / 2;
  return cellsPath(sparkleCells(0, 0, arm, core), size, ox, oy);
}

/** Hình tròn pixel (đặc) bán kính r ô, tâm (cx, cy) — dùng cho hành tinh, chấm sao. */
export function discCells(cx: number, cy: number, r: number): Cell[] {
  const cells: Cell[] = [];
  const R = r + 0.35;
  for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++)
    for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) if (dx * dx + dy * dy <= R * R) cells.push([cx + dx, cy + dy]);
  return cells;
}

/** Đường tròn pixel (viền) — thuật toán điểm giữa. */
export function ringCells(cx: number, cy: number, r: number): Cell[] {
  const out = new Map<string, Cell>();
  const add = (x: number, y: number) => out.set(`${x},${y}`, [x, y]);
  let x = r;
  let y = 0;
  let err = 1 - r;
  while (x >= y) {
    for (const [a, b] of [
      [x, y],
      [y, x],
      [-y, x],
      [-x, y],
      [-x, -y],
      [-y, -x],
      [y, -x],
      [x, -y],
    ])
      add(cx + a, cy + b);
    y++;
    if (err < 0) err += 2 * y + 1;
    else {
      x--;
      err += 2 * (y - x) + 1;
    }
  }
  return [...out.values()];
}

/** Hình tròn pixel đặc trong toạ độ thật. */
export function pixelDiscPath(x: number, y: number, r: number, cell?: number): string {
  const size = cell ?? Math.max(r / 2.5, 0.5);
  const rr = Math.max(0, Math.round(r / size - 0.5));
  return cellsPath(discCells(0, 0, rr), size, x - size / 2, y - size / 2);
}

/** Đường nối pixel giữa hai điểm thật, trên lưới ô `cell`; `every` > 1 cho nét chấm. */
export function pixelLinePath(x0: number, y0: number, x1: number, y1: number, cell: number, every = 1, skipEnds = 0): string {
  const cells = bresenham(x0 / cell, y0 / cell, x1 / cell, y1 / cell);
  const picked = cells.filter((_, i) => i >= skipEnds && i < cells.length - skipEnds && i % every === 0);
  return cellsPath(picked, cell, -cell / 2, -cell / 2);
}
