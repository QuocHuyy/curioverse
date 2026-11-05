/** Đường chân trời thành phố pixel (cố định theo seed) — dùng chung cho footer và ảnh OG. */
import { type Cell } from './pixel';
import { hash, mulberry32 } from './sigil';

export function skyline(seed: string, W = 400, H = 34) {
  const rand = mulberry32(hash(`skyline-${seed}`));
  const back: Cell[] = [];
  const front: Cell[] = [];
  const winOn: Cell[] = [];
  const winBlink: Cell[] = [];

  const building = (layer: Cell[], x0: number, w: number, h: number, windows: boolean) => {
    for (let x = x0; x < x0 + w && x < W; x++) for (let y = H - h; y < H; y++) layer.push([x, y]);
    // ăng-ten / mái
    if (rand() < 0.3 && w > 4) for (let y = H - h - 3; y < H - h; y++) layer.push([x0 + Math.floor(w / 2), y]);
    if (!windows) return;
    for (let y = H - h + 2; y < H - 2; y += 3)
      for (let x = x0 + 1; x < x0 + w - 1; x += 2) {
        const r = rand();
        if (r < 0.22) winOn.push([x, y]);
        else if (r < 0.3) winBlink.push([x, y]);
      }
  };

  let x = 0;
  while (x < W) {
    const w = 6 + Math.floor(rand() * 10);
    building(back, x, w, 10 + Math.floor(rand() * 20), false);
    x += w + (rand() < 0.3 ? 1 : 0);
  }
  x = Math.floor(rand() * 5);
  while (x < W) {
    const w = 5 + Math.floor(rand() * 9);
    const h = 5 + Math.floor(Math.pow(rand(), 1.6) * 20);
    building(front, x, w, h, true);
    x += w + 2 + Math.floor(rand() * 7);
  }
  // mặt đất
  for (let gx = 0; gx < W; gx++) front.push([gx, H - 1]);
  return { W, H, back, front, winOn, winBlink };
}
