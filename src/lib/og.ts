/**
 * Ảnh chia sẻ (Open Graph) 1200×630 sinh lúc build: satori (HTML → SVG) + sharp (SVG → PNG).
 * Font: bản TTF đầy đủ trong src/assets/og-fonts (satori không đọc woff2 và không ghép glyph giữa các subset).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { makeSigil, sparklePath, starfield } from './sigil';

const FONT_DIR = join(process.cwd(), 'src', 'assets', 'og-fonts');
const font = (file: string) => readFileSync(join(FONT_DIR, file));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
function loadFonts() {
  fonts ??= [
    { name: 'Fraunces', weight: 600, style: 'normal', data: font('Fraunces_600SemiBold.ttf') },
    { name: 'Be Vietnam Pro', weight: 400, style: 'normal', data: font('BeVietnamPro_400Regular.ttf') },
    { name: 'Be Vietnam Pro', weight: 600, style: 'normal', data: font('BeVietnamPro_600SemiBold.ttf') },
  ];
  return fonts;
}

type Node = { type: string; props: Record<string, unknown> & { children?: unknown; style?: Record<string, unknown> } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

const COLORS = {
  stories: '#F5C26B',
  work: '#9DB2FF',
  notes: '#7FD6C5',
  default: '#F5C26B',
} as const;

function sigilSvg(seed: string, color: string): string {
  const { stars, lines } = makeSigil(seed);
  const l = lines
    .map(([a, b]) => `<line x1="${stars[a].x}" y1="${stars[a].y}" x2="${stars[b].x}" y2="${stars[b].y}" stroke="rgba(200,211,255,.55)" stroke-width=".5"/>`)
    .join('');
  const s = stars
    .map((st) =>
      st.bright
        ? `<path d="${sparklePath(st.x, st.y, st.r * 2.2)}" fill="${color}"/><circle cx="${st.x}" cy="${st.y}" r="${st.r * 3.4}" fill="${color}" opacity=".12"/>`
        : `<circle cx="${st.x}" cy="${st.y}" r="${st.r}" fill="#F2EFFF"/>`,
    )
    .join('');
  const rings = `<g fill="none" stroke="rgba(200,211,255,.08)" stroke-width=".4"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="31"/><path d="M4 50h92M50 4v92"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${rings}${l}${s}</svg>`;
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
  const dots = starfield(`og-${input.seed}`, 70, 1200, 630);
  const sigil = `data:image/svg+xml;base64,${Buffer.from(sigilSvg(input.seed, color)).toString('base64')}`;
  const brandStar = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="14" ry="6.2" transform="rotate(-24 16 16)" fill="none" stroke="#9a95b2" stroke-width="1.4" stroke-dasharray="2 2.4"/><path d="${sparklePath(16, 16, 9.5, 0.2)}" fill="#FFD58A"/><circle cx="27.2" cy="10.6" r="1.8" fill="#B3C3FF"/></svg>`,
  ).toString('base64')}`;
  const titleSize = input.title.length > 60 ? 54 : input.title.length > 36 ? 64 : 76;

  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      position: 'relative',
      backgroundColor: '#0B0F1E',
      backgroundImage:
        'radial-gradient(circle at 78% 30%, rgba(86,100,212,0.35), rgba(11,15,30,0) 55%), radial-gradient(circle at 10% 100%, rgba(245,194,107,0.16), rgba(11,15,30,0) 50%)',
      color: '#E9E6F2',
      fontFamily: 'Be Vietnam Pro',
    },
    [
      ...dots.map((d) =>
        h('div', {
          position: 'absolute',
          left: d.x,
          top: d.y,
          width: d.r * 3.2,
          height: d.r * 3.2,
          borderRadius: 999,
          backgroundColor: '#F2EFFF',
          opacity: d.o * 0.8,
        }),
      ),
      h('img', { position: 'absolute', right: 40, top: 95, width: 440, height: 440 }, undefined, { src: sigil, width: 440, height: 440 }),
      h(
        'div',
        { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 760, height: '100%', padding: '64px 0 56px 72px' },
        [
          h('div', { display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, fontFamily: 'Fraunces', fontWeight: 600 }, [
            h('img', { width: 40, height: 40 }, undefined, { src: brandStar, width: 40, height: 40 }),
            h('span', {}, 'Curioverse'),
          ]),
          h('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
            h('div', { fontSize: 22, fontWeight: 600, letterSpacing: 3, color, textTransform: 'uppercase' }, input.label),
            h('div', { fontFamily: 'Fraunces', fontWeight: 600, fontSize: titleSize, lineHeight: 1.15, letterSpacing: -1 }, clip(input.title, 90)),
            input.description
              ? h('div', { fontSize: 27, lineHeight: 1.5, color: '#C3BFD4' }, clip(input.description, 150))
              : h('div', {}, ''),
          ]),
          h('div', { display: 'flex', fontSize: 22, color: '#9A95B2' }, input.footer),
        ],
      ),
    ],
  );

  const svg = await satori(tree as any, { width: 1200, height: 630, fonts: loadFonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
