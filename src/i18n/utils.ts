import { ui, type Lang, type UIKey } from './ui';

export type { Lang, UIKey };
export const LANGS: Lang[] = ['vi', 'en'];
export const DEFAULT_LANG: Lang = 'vi';
export const LOCALES: Record<Lang, string> = { vi: 'vi-VN', en: 'en-US' };

export function t(lang: Lang) {
  return (key: UIKey): string => ui[lang][key] ?? ui.vi[key] ?? key;
}

export const otherLang = (lang: Lang): Lang => (lang === 'vi' ? 'en' : 'vi');

/** Các mục của website và đường dẫn theo từng ngôn ngữ. */
export const SECTIONS = {
  home: { vi: '', en: 'en' },
  stories: { vi: 'cau-chuyen', en: 'en/stories' },
  work: { vi: 'cong-viec', en: 'en/work' },
  notes: { vi: 'ghi-chep', en: 'en/notes' },
  journey: { vi: 'hanh-trinh', en: 'en/journey' },
  universe: { vi: 'ban-do-sao', en: 'en/universe' },
  about: { vi: 'gioi-thieu', en: 'en/about' },
  now: { vi: 'now', en: 'en/now' },
  topics: { vi: 'chu-de', en: 'en/topics' },
} as const satisfies Record<string, Record<Lang, string>>;

export type Section = keyof typeof SECTIONS;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ghép base path (ví dụ `/curioverse`) vào một đường dẫn nội bộ, luôn có `/` ở cuối nếu là trang. */
export function url(path = '/'): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  let p = path.startsWith('/') ? path : `/${path}`;
  const [pathname, rest = ''] = splitSuffix(p);
  p = pathname;
  const last = p.split('/').pop() ?? '';
  if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(last)) p += '/';
  return `${BASE}${p}${rest}`;
}

function splitSuffix(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i === -1 ? [path, ''] : [path.slice(0, i), path.slice(i)];
}

export function sectionUrl(section: Section, lang: Lang, ...rest: string[]): string {
  const parts = [SECTIONS[section][lang], ...rest].filter(Boolean);
  return url('/' + parts.join('/'));
}

/** Bỏ base path khỏi pathname hiện tại. */
export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || '/';
  return pathname;
}

export function langFromPath(pathname: string): Lang {
  const p = stripBase(pathname);
  return p === '/en' || p.startsWith('/en/') ? 'en' : 'vi';
}

/** Tìm trang tương ứng ở ngôn ngữ còn lại cho các trang mục (không phải bài viết). */
export function counterpartPath(pathname: string, target: Lang): string {
  const p = stripBase(pathname).replace(/^\/+|\/+$/g, '');
  const from = langFromPath(pathname);
  for (const [section, paths] of Object.entries(SECTIONS) as [Section, Record<Lang, string>][]) {
    const prefix = paths[from];
    if (p === prefix) return sectionUrl(section, target);
    // Trang con (bài viết, chủ đề) chưa có bản tương ứng → về trang mục bên ngôn ngữ kia.
    // (Khi có bản dịch, trang truyền `alternates` nên không đi qua hàm này.)
    if (section !== 'home' && prefix && p.startsWith(prefix + '/')) return sectionUrl(section, target);
  }
  return sectionUrl('home', target);
}

export function formatDate(
  date: Date,
  lang: Lang,
  precision: 'day' | 'month' | 'year' = 'day',
): string {
  const opts: Intl.DateTimeFormatOptions =
    precision === 'year'
      ? { year: 'numeric' }
      : precision === 'month'
        ? { month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(LOCALES[lang], { ...opts, timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

export function formatShortDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString();
}

/** Bỏ dấu tiếng Việt và tạo slug: "Thị giác máy tính" → "thi-giac-may-tinh". */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Chuẩn hóa để so khớp không dấu. */
export function fold(input: string): string {
  return slugify(input).replace(/-/g, ' ');
}
