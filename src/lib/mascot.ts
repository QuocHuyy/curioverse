/**
 * "Curio" — linh vật pixel của Curioverse: một ngôi sao 4 cánh tròn trịa, mắt to kiểu anime.
 * Sinh hoàn toàn bằng code (đối xứng, tự có viền và đổ bóng) để dễ chỉnh tỉ lệ.
 */
import { cellsPath, type Cell } from './pixel';

export type Mood = 'happy' | 'sleepy' | 'sad' | 'wink';

const SIZE = 21; // lưới 21×21, tâm (10, 10)
const C = 10;

const key = (x: number, y: number) => `${x},${y}`;

function bodyCells(): Set<string> {
  const s = new Set<string>();
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const dx = Math.abs(x - C);
      const dy = Math.abs(y - C);
      // thân tròn
      const disc = dx * dx + dy * dy <= 6.6 * 6.6;
      // 4 cánh nhọn: khoảng cách "kim cương lõm" (astroid) |dx|^0.6 + |dy|^0.6
      const astroid = Math.pow(dx, 0.74) + Math.pow(dy, 0.74) <= Math.pow(9.4, 0.74);
      if (disc || astroid) s.add(key(x, y));
    }
  return s;
}

export interface MascotLayer {
  fill: string;
  d: string;
  cls?: string;
}

export function mascot(mood: Mood = 'happy') {
  const body = bodyCells();
  const has = (x: number, y: number) => body.has(key(x, y));

  // viền: ô ngoài kề cạnh với thân
  const outline: Cell[] = [];
  for (let y = -1; y <= SIZE; y++)
    for (let x = -1; x <= SIZE; x++) {
      if (has(x, y)) continue;
      if (has(x + 1, y) || has(x - 1, y) || has(x, y + 1) || has(x, y - 1)) outline.push([x, y]);
    }

  const fillCells: Cell[] = [];
  const shade: Cell[] = [];
  const light: Cell[] = [];
  for (const k of body) {
    const [x, y] = k.split(',').map(Number);
    // bóng: mép dưới-phải (ô có hàng xóm ngoài thân ở phía dưới hoặc phải, trong vòng 2 ô)
    const edgeBR = !has(x + 1, y) || !has(x, y + 1) || !has(x + 1, y + 1) || (!has(x + 2, y) && !has(x, y + 2));
    const edgeTL = !has(x - 1, y) || !has(x, y - 1);
    if (edgeBR && x + y >= 2 * C - 1) shade.push([x, y]);
    else if (edgeTL && x + y <= 2 * C - 3) light.push([x, y]);
    else fillCells.push([x, y]);
  }
  // vệt bóng loáng
  const gloss: Cell[] = [
    [6, 6],
    [7, 6],
    [6, 7],
  ];

  const eyes: Cell[] = [];
  const shine: Cell[] = [];
  const blush: Cell[] = [];
  const mouth: Cell[] = [];
  const extra: Cell[] = [];
  const L = 7; // cột mắt trái (2 ô: 7–8)
  const R = 12; // cột mắt phải (12–13)
  const ey = 9; // hàng trên của mắt

  const openEye = (cx: number) => {
    for (let y = ey; y < ey + 3; y++) for (let x = cx; x < cx + 2; x++) eyes.push([x, y]);
    shine.push([cx, ey]);
  };
  const closedEye = (cx: number, smile = true) => {
    if (smile) {
      // ^ (cười híp mắt)
      eyes.push([cx, ey + 2], [cx + 1, ey + 1], [cx + 2 - 1, ey + 1]);
      eyes.push([cx - 1 + 0, ey + 2]);
    } else {
      // ‿ (mắt nhắm ngủ)
      eyes.push([cx - 1, ey + 1], [cx, ey + 2], [cx + 1, ey + 2], [cx + 2, ey + 1]);
    }
  };

  if (mood === 'happy') {
    openEye(L);
    openEye(R);
  } else if (mood === 'wink') {
    openEye(L);
    eyes.push([R - 1, ey + 1], [R, ey + 2], [R + 1, ey + 1], [R + 2, ey + 1]);
  } else if (mood === 'sleepy') {
    closedEye(L, false);
    closedEye(R, false);
  } else if (mood === 'sad') {
    openEye(L);
    openEye(R);
    // giọt nước mắt
    extra.push([R + 1, ey + 3], [R + 1, ey + 4]);
  }

  blush.push([L - 2, ey + 3], [L - 1, ey + 3], [R + 2, ey + 3], [R + 3, ey + 3]);

  if (mood === 'sad') {
    mouth.push([9, 14], [10, 13], [11, 14]);
  } else if (mood === 'sleepy') {
    mouth.push([10, 13]);
  } else {
    // miệng ω
    mouth.push([9, 13], [10, 14], [11, 13]);
  }

  const glossSet = new Set(gloss.map(([x, y]) => key(x, y)));
  const faceSet = new Set([...eyes, ...shine, ...blush, ...mouth, ...extra].map(([x, y]) => key(x, y)));
  const clean = (cells: Cell[]) => cells.filter(([x, y]) => !faceSet.has(key(x, y)) && !glossSet.has(key(x, y)));

  // khung mắt nhắm (dùng cho hiệu ứng chớp mắt khi mood = happy)
  const blink: Cell[] = [];
  if (mood === 'happy') for (const cx of [L, R]) blink.push([cx, ey + 2], [cx + 1, ey + 2]);

  const layers: MascotLayer[] = [
    { fill: 'var(--m-outline)', d: cellsPath(outline.map(([x, y]) => [x + 1, y + 1])) },
    { fill: 'var(--m-body)', d: cellsPath(clean(fillCells).map(([x, y]) => [x + 1, y + 1])) },
    { fill: 'var(--m-shade)', d: cellsPath(clean(shade).map(([x, y]) => [x + 1, y + 1])) },
    { fill: 'var(--m-light)', d: cellsPath(clean(light).map(([x, y]) => [x + 1, y + 1])) },
    { fill: 'var(--m-gloss)', d: cellsPath(gloss.map(([x, y]) => [x + 1, y + 1])) },
    { fill: 'var(--m-blush)', d: cellsPath(blush.map(([x, y]) => [x + 1, y + 1])) },
    { fill: 'var(--m-ink)', d: cellsPath(mouth.map(([x, y]) => [x + 1, y + 1])) },
    { fill: 'var(--m-ink)', d: cellsPath(eyes.filter(([x, y]) => !shine.some(([a, b]) => a === x && b === y)).map(([x, y]) => [x + 1, y + 1])), cls: 'm-eyes' },
    { fill: 'var(--m-gloss)', d: cellsPath(shine.map(([x, y]) => [x + 1, y + 1])), cls: 'm-eyes' },
    { fill: 'var(--m-tear)', d: cellsPath(extra.map(([x, y]) => [x + 1, y + 1])) },
  ];
  if (blink.length) {
    // nền che mắt + vạch mắt nhắm
    const eyeArea: Cell[] = [];
    for (const cx of [L, R]) for (let y = ey; y < ey + 3; y++) for (let x = cx; x < cx + 2; x++) eyeArea.push([x, y]);
    layers.push({ fill: 'var(--m-body)', d: cellsPath(eyeArea.map(([x, y]) => [x + 1, y + 1])), cls: 'm-blink' });
    layers.push({ fill: 'var(--m-ink)', d: cellsPath(blink.map(([x, y]) => [x + 1, y + 1])), cls: 'm-blink' });
  }
  return { size: SIZE + 2, layers: layers.filter((l) => l.d) };
}
