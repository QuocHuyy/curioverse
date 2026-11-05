/**
 * Ảnh chia sẻ (Open Graph) 1200×630 sinh lúc build: satori (HTML → SVG) + sharp (SVG → PNG).
 * Phong cách pixel + anime: bầu trời đêm phân tầng, cửa sổ RPG chứa tiêu đề, chòm sao pixel của bài,
 * linh vật Curio và thành phố lên đèn. Toàn bộ phần trang trí là một ảnh SVG nền; chữ do satori dàn trang.
 * Font: bản TTF (đã subset) trong src/assets/og-fonts — satori không đọc woff2.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { makeSigil, starfield } from './sigil';
import { bresenham, cellsPath, ringCells, sparkleCells, type Cell } from './pixel';
import { mascot } from './mascot';
import { brandMark } from './brand';
import { skyline } from './skyline';

const FONT_DIR = join(process.cwd(), 'src', 'assets', 'og-fonts');
const font = (file: string) => readFileSync(join(FONT_DIR, file));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
function loadFonts() {
  fonts ??= [
    { name: 'Handjet', weight: 700, style: 'normal', data: font('Handjet_700Bold.ttf') },
    { name: 'M PLUS Rounded 1c', weight: 400, style: 'normal', data: font('MPLUSRounded1c_400Regular.ttf') },
    { name: 'M PLUS Rounded 1c', weight: 700, style: 'normal', data: font('MPLUSRounded1c_700Bold.ttf') },
    { name: 'VT323', weight: 400, style: 'normal', data: font('VT323_400Regular.ttf') },
  ];
  return fonts;
}

type Node = { type: string; props: Record<string, unknown> & { children?: unknown; style?: Record<string, unknown> } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

const COLORS = {
  stories: '#FFD166',
  work: '#8CCAFF',
  notes: '#7AEBC6',
  default: '#FF9CCD',
} as const;

const W = 1200;
const H = 630;
// Cửa sổ chứa chữ
const WIN = { x: 56, y: 64, w: 724, h: 446 };
const BAR = 46;
const P = 6; // 1 điểm ảnh của khung

/** Khung pixel: viền khuyết góc + bóng đổ bậc thang. */
function frame(x: number, y: number, w: number, hgt: number, fill: string, line: string, shadow: string, s: number) {
  const r = (rx: number, ry: number, rw: number, rh: number, c: string) => `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${c}"/>`;
  return [
    // bóng đổ: cùng hình khuyết góc, lệch xuống-phải `s`
    r(x + s, y + s - P, w, hgt + 2 * P, shadow),
    r(x + s - P, y + s, w + 2 * P, hgt, shadow),
    // viền
    r(x, y - P, w, hgt + 2 * P, line),
    r(x - P, y, w + 2 * P, hgt, line),
    // nền
    r(x, y, w, hgt, fill),
  ].join('');
}

function sigilCells(seed: string, size: number) {
  const { stars, lines } = makeSigil(seed);
  const G = 32;
  const cell = size / G;
  const snap = (v: number) => Math.min(G - 3, Math.max(2, Math.round((v / 100) * G)));
  const pts = stars.map((s) => ({ ...s, cx: snap(s.x), cy: snap(s.y) }));
  const line: Cell[] = [];
  for (const [a, b] of lines) {
    const seg = bresenham(pts[a].cx, pts[a].cy, pts[b].cx, pts[b].cy);
    seg.forEach((c, i) => i > 1 && i < seg.length - 2 && i % 2 === 0 && line.push(c));
  }
  const chart: Cell[] = [];
  for (const r of [14, 9]) ringCells(16, 16, r).forEach(([x, y]) => (x + y) % 2 === 0 && chart.push([x, y]));
  const dots: Cell[] = [];
  const bright: Cell[] = [];
  for (const s of pts) {
    if (s.bright) bright.push(...sparkleCells(s.cx, s.cy, 3, 1));
    else if (s.r > 2) dots.push(...sparkleCells(s.cx, s.cy, 1, 0));
    else dots.push([s.cx, s.cy]);
  }
  return { cell, line, chart, dots, bright };
}

function sceneSvg(seed: string, color: string): string {
  const out: string[] = [];
  // Trời đêm phân tầng
  const bands = ['#070519', '#0b0824', '#100c2e', '#160f3c', '#1d134a', '#251758', '#2e1a63', '#3a1d6c'];
  bands.forEach((c, i) => out.push(`<rect x="0" y="${Math.round((i * H) / bands.length)}" width="${W}" height="${Math.ceil(H / bands.length) + 1}" fill="${c}"/>`));
  // Sao pixel
  const stars = starfield(`og-${seed}`, 120, W, H * 0.8);
  out.push(
    `<path fill="#F4F0FF" opacity=".7" d="${cellsPath(
      stars.map((s) => [Math.round(s.x / 3), Math.round(s.y / 3)] as Cell),
      3,
    )}"/>`,
  );
  for (const s of stars.filter((s) => s.o > 0.78).slice(0, 7))
    out.push(`<path fill="#FFE28F" d="${cellsPath(sparkleCells(0, 0, 2, 1), 4, Math.round(s.x), Math.round(s.y))}"/>`);
  // Thành phố lên đèn
  const sk = skyline('og', 300, 26);
  const sc = W / sk.W;
  const oy = H - sk.H * sc;
  out.push(`<path fill="#1c1547" d="${cellsPath(sk.back, sc, 0, oy)}"/>`);
  out.push(`<path fill="#0b0820" d="${cellsPath(sk.front, sc, 0, oy)}"/>`);
  out.push(`<path fill="#FFE28F" opacity=".9" d="${cellsPath(sk.winOn, sc, 0, oy)}"/>`);
  // Chòm sao của bài (màn hình bên phải)
  const SX = 836;
  const SY = 92;
  const SS = 316;
  out.push(frame(SX, SY, SS, SS, '#120d36', '#8F84EA', '#05031a', 18));
  const sg = sigilCells(seed, SS - 24);
  const ox = SX + 12;
  const oy2 = SY + 12;
  out.push(`<path fill="rgba(208,201,242,.12)" d="${cellsPath(sg.chart, sg.cell, ox, oy2)}"/>`);
  out.push(`<path fill="rgba(208,201,242,.6)" d="${cellsPath(sg.line, sg.cell, ox, oy2)}"/>`);
  out.push(`<path fill="#F4F0FF" d="${cellsPath(sg.dots, sg.cell, ox, oy2)}"/>`);
  out.push(`<path fill="${color}" d="${cellsPath(sg.bright, sg.cell, ox, oy2)}"/>`);
  // Cửa sổ chữ
  out.push(frame(WIN.x, WIN.y, WIN.w, WIN.h, '#1b1744', '#8F84EA', '#05031a', 18));
  out.push(`<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${BAR}" fill="#8F84EA"/>`);
  ['#FF7AB8', '#FFE28F', '#A9F5DC'].forEach((c, i) =>
    out.push(`<rect x="${WIN.x + WIN.w - 96 + i * 26}" y="${WIN.y + 16}" width="15" height="15" fill="${c}"/>`),
  );
  // ▼ nhấp nháy của hộp thoại
  out.push(`<path fill="#FF7AB8" d="${cellsPath([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [1, 1], [2, 1], [3, 1], [2, 2]], 5, WIN.x + WIN.w - 46, WIN.y + WIN.h - 34)}"/>`);
  // Logo pixel trên thanh tiêu đề
  const b = brandMark();
  const bs = 2;
  const bx = WIN.x + 16;
  const by = WIN.y + 6;
  out.push(`<g transform="translate(${bx} ${by}) scale(${bs})"><path fill="#FFE28F" d="${b.core}"/><path fill="#fff6cf" d="${b.coreLight}"/><path fill="#120f33" d="${b.orbit}"/><path fill="#FF7AB8" d="${b.moon}"/></g>`);
  // Curio
  const m = mascot('happy');
  const mc = 7;
  const mx = SX - 64;
  const my = SY + SS - 92;
  const pal: Record<string, string> = {
    'var(--m-outline)': '#2b1d3f',
    'var(--m-body)': '#ffd45a',
    'var(--m-shade)': '#f2a23c',
    'var(--m-light)': '#fff0a6',
    'var(--m-gloss)': '#ffffff',
    'var(--m-blush)': '#ff8fb8',
    'var(--m-ink)': '#2b1d3f',
    'var(--m-tear)': '#7cc8ff',
  };
  for (const l of m.layers.filter((l) => l.cls !== 'm-blink'))
    out.push(`<path fill="${pal[l.fill] ?? '#fff'}" transform="translate(${mx} ${my}) scale(${mc})" d="${l.d}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges">${out.join('')}</svg>`;
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

export interface OgInput {
  title: string;
  description: string;
  label: string;
  seed: string;
  kind: keyof typeof COLORS;
  footer: string;
}

export async function renderOg(input: OgInput): Promise<Buffer> {
  const color = COLORS[input.kind] ?? COLORS.default;
  const scene = `data:image/svg+xml;base64,${Buffer.from(sceneSvg(input.seed, color)).toString('base64')}`;
  const title = clip(input.title, 80);
  const titleSize = title.length > 56 ? 62 : title.length > 34 ? 74 : 88;
  const desc = clip(input.description, 130);

  const tree = h(
    'div',
    { width: W, height: H, display: 'flex', position: 'relative', color: '#F5F1FF', fontFamily: 'M PLUS Rounded 1c' },
    [
      h('img', { position: 'absolute', left: 0, top: 0, width: W, height: H }, undefined, { src: scene, width: W, height: H }),
      // thanh tiêu đề cửa sổ
      h(
        'div',
        {
          position: 'absolute',
          left: WIN.x + 58,
          top: WIN.y + 4,
          height: BAR - 8,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: 'VT323',
          fontSize: 30,
          letterSpacing: 2,
          color: '#120f33',
          textTransform: 'uppercase',
        },
        input.label.toLowerCase() === 'curioverse'
          ? [h('span', {}, 'Curioverse')]
          : [h('span', {}, 'Curioverse'), h('span', { opacity: 0.6 }, '·'), h('span', {}, input.label)],
      ),
      // nội dung
      h(
        'div',
        {
          position: 'absolute',
          left: WIN.x + 40,
          top: WIN.y + BAR + 30,
          width: WIN.w - 80,
          height: WIN.h - BAR - 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
        [
          h('div', { display: 'flex', flexDirection: 'column', gap: 20 }, [
            h(
              'div',
              {
                fontFamily: 'Handjet',
                fontWeight: 700,
                fontSize: titleSize,
                lineHeight: 1.02,
                color: '#F5F1FF',
                textShadow: `5px 5px 0 #6b2a7a`,
              },
              title,
            ),
            desc ? h('div', { fontSize: 25, lineHeight: 1.55, color: '#D0C9F2' }, desc) : h('div', {}, ''),
          ]),
          h('div', { display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'VT323', fontSize: 28, color: color }, [
            h('div', { width: 14, height: 14, backgroundColor: color }),
            h('span', {}, input.footer),
          ]),
        ],
      ),
    ],
  );

  const svg = await satori(tree as any, { width: W, height: H, fonts: loadFonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
