/** Hình học của logo pixel — dùng chung cho BrandMark, favicon và ảnh OG. */
import { cellsPath, sparkleCells, type Cell } from './pixel';

export function brandMark() {
  const C = 8;
  const core = sparkleCells(C, C, 6, 3);
  const coreSet = new Set(core.map(([x, y]) => `${x},${y}`));
  // vệt sáng ở cánh trên-trái
  const light: Cell[] = [
    [C, C - 5],
    [C, C - 4],
    [C - 1, C - 2],
    [C - 2, C - 1],
    [C - 1, C - 1],
  ];
  const lightSet = new Set(light.map(([x, y]) => `${x},${y}`));

  // quỹ đạo elip nghiêng -24°: nửa sau nằm sau ngôi sao, nửa trước vẽ đè lên (tạo chiều sâu)
  const orbit = new Map<string, { cell: Cell; front: boolean }>();
  const rx = 7.8;
  const ry = 2.5;
  const a = (-20 * Math.PI) / 180;
  for (let i = 0; i < 360; i += 2) {
    const t = (i * Math.PI) / 180;
    const ex = rx * Math.cos(t);
    const ey = ry * Math.sin(t);
    const x = Math.round(C + ex * Math.cos(a) - ey * Math.sin(a));
    const y = Math.round(C + ex * Math.sin(a) + ey * Math.cos(a));
    const k = `${x},${y}`;
    if (!orbit.has(k)) orbit.set(k, { cell: [x, y], front: Math.sin(t) > 0 });
  }
  const orbitCells = [...orbit.values()]
    .filter(({ cell: [x, y], front }) => front || !coreSet.has(`${x},${y}`))
    .map(({ cell }) => cell);

  const moon: Cell[] = [
    [14, 2],
    [15, 2],
    [14, 3],
    [15, 3],
  ];
  const moonSet = new Set(moon.map(([x, y]) => `${x},${y}`));

  return {
    core: cellsPath(core.filter(([x, y]) => !lightSet.has(`${x},${y}`))),
    coreLight: cellsPath(light),
    orbit: cellsPath(orbitCells.filter(([x, y]) => !moonSet.has(`${x},${y}`) && !moonSet.has(`${x - 1},${y}`))),
    moon: cellsPath(moon),
  };
}
