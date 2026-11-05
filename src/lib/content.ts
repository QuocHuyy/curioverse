import { getCollection, type CollectionEntry } from 'astro:content';
import { sectionUrl, tagSlug, otherLang, url, type Lang } from '~/i18n/utils';
import { validateContent } from './validate';

export type Kind = 'stories' | 'work' | 'notes';
export type WorkData = CollectionEntry<'work'>['data'];
export type Stage = 'nebula' | 'protostar' | 'star';
export const KINDS: Kind[] = ['stories', 'work', 'notes'];
export const STAGES: Stage[] = ['nebula', 'protostar', 'star'];

/** Nháp hiện khi chạy dev, hoặc khi build với PUBLIC_SHOW_DRAFTS=true (để xem trước). */
export const SHOW_DRAFTS = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';

type AnyEntry = CollectionEntry<'stories'> | CollectionEntry<'work'> | CollectionEntry<'notes'>;

/** Dạng chuẩn hóa của mọi bài viết — dùng cho thẻ bài, đồ thị, RSS, tìm kiếm. */
export interface Item {
  kind: Kind;
  /** id trong collection, ví dụ "vi/aeroeyes" */
  id: string;
  slug: string;
  lang: Lang;
  /** Khóa ghép cặp bản dịch, duy nhất theo loại: "work:aeroeyes" */
  key: string;
  title: string;
  description: string;
  /** Ngày chính: ngày đăng (câu chuyện), ngày bắt đầu (dự án), ngày gieo (ghi chép) */
  date: Date;
  /** Ngày dùng để xếp "mới nhất" */
  sortDate: Date;
  updated?: Date;
  /** Ngày đăng thật sự (RSS, JSON-LD). Câu chuyện: `date`; ghi chép: `planted`; dự án: `published` nếu có. */
  published: Date;
  tags: string[];
  related: string[];
  draft: boolean;
  featured: boolean;
  url: string;
  body: string;
  readingMinutes: number;
  stage?: Stage;
  entry: AnyEntry;
}

export function parseId(id: string): { lang: Lang; slug: string } {
  const [first, ...rest] = id.split('/');
  if ((first === 'vi' || first === 'en') && rest.length) return { lang: first, slug: rest.join('/') };
  return { lang: 'vi', slug: id };
}

export function entryUrl(kind: Kind, lang: Lang, slug: string): string {
  return sectionUrl(kind, lang, slug);
}

export function tagUrl(tag: string, lang: Lang): string {
  return sectionUrl('topics', lang, tagSlug(tag));
}

/** Thời gian đọc ước tính. Tiếng Việt tính theo âm tiết (~230 âm tiết/phút). */
export function readingMinutes(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^import .*$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

function toItem(kind: Kind, entry: AnyEntry): Item {
  const { lang, slug } = parseId(entry.id);
  const data = entry.data as Record<string, any>;
  let date: Date;
  let sortDate: Date;
  let updated: Date | undefined;
  if (kind === 'stories') {
    date = data.date;
    updated = data.updated;
    sortDate = data.date;
  } else if (kind === 'work') {
    date = data.period.start;
    updated = data.period.end;
    sortDate = data.period.end ?? data.period.start;
  } else {
    date = data.planted;
    updated = data.tended;
    sortDate = data.tended ?? data.planted;
  }
  const body = entry.body ?? '';
  return {
    kind,
    id: entry.id,
    slug,
    lang,
    key: `${kind}:${data.translationKey ?? slug}`,
    title: data.title,
    description: data.description,
    date,
    sortDate,
    updated,
    published: kind === 'work' ? (data.published ?? sortDate) : date,
    tags: data.tags ?? [],
    related: data.related ?? [],
    draft: data.draft ?? false,
    featured: data.featured ?? false,
    url: entryUrl(kind, lang, slug),
    body,
    readingMinutes: readingMinutes(body),
    stage: kind === 'notes' ? data.stage : undefined,
    entry,
  };
}

const cache = new Map<Kind, Promise<Item[]>>();

/** Mọi bài của một loại (đã lọc nháp nếu cần), xếp mới nhất trước. */
export function getItems(kind: Kind): Promise<Item[]> {
  if (!cache.has(kind)) {
    cache.set(
      kind,
      getCollection(kind).then((entries) => {
        const items = (entries as AnyEntry[])
          .map((e) => toItem(kind, e))
          .filter((i) => SHOW_DRAFTS || !i.draft);
        if (!import.meta.env.DEV) warnLeftoverPrompts(items);
        return sortItems(kind, items);
      }),
    );
  }
  return cache.get(kind)!;
}

function sortItems(kind: Kind, items: Item[]): Item[] {
  if (kind === 'work') {
    return items.sort(
      (a, b) =>
        ((a.entry.data as any).order ?? 100) - ((b.entry.data as any).order ?? 100) ||
        b.sortDate.getTime() - a.sortDate.getTime(),
    );
  }
  return items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
}

const warned = new Set<string>();
function warnLeftoverPrompts(items: Item[]) {
  for (const i of items) {
    if (!i.draft && i.body.includes('<Prompt') && !warned.has(i.id)) {
      warned.add(i.id);
      console.warn(`[curioverse] "${i.kind}/${i.id}" đã đăng nhưng vẫn còn <Prompt> (gợi ý viết) — nhớ viết nốt nhé.`);
    }
  }
}

let validation: Promise<void> | undefined;

export async function getAllItems(): Promise<Item[]> {
  const all = (await Promise.all(KINDS.map(getItems))).flat();
  // Kiểm tra nội dung một lần cho cả lần build (xem validate.ts)
  validation ??= validateContent(all);
  await validation;
  return all.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
}

/** Bài của một ngôn ngữ. */
export async function getItemsByLang(kind: Kind, lang: Lang): Promise<Item[]> {
  return (await getItems(kind)).filter((i) => i.lang === lang);
}

/**
 * Bài cho trang danh sách của một ngôn ngữ:
 * `primary` = bài viết bằng ngôn ngữ đó; `fallback` = bài ở ngôn ngữ kia chưa có bản dịch.
 */
export async function getListing(kind: Kind, lang: Lang): Promise<{ primary: Item[]; fallback: Item[] }> {
  const items = await getItems(kind);
  const primary = items.filter((i) => i.lang === lang);
  const keys = new Set(primary.map((i) => i.key));
  const fallback = items.filter((i) => i.lang !== lang && !keys.has(i.key));
  return { primary, fallback };
}

/**
 * Một bài cho mỗi "tác phẩm": ưu tiên bản ở ngôn ngữ `lang`, nếu không có thì lấy bản còn lại.
 * Dùng cho bản đồ sao, chủ đề, trang chủ.
 */
export async function getMergedItems(lang: Lang, kinds: Kind[] = KINDS): Promise<Item[]> {
  await getAllItems(); // chạy kiểm tra nội dung trước khi dựng trang
  const all = (await Promise.all(kinds.map(getItems))).flat();
  const byKey = new Map<string, Item>();
  for (const item of all) {
    const existing = byKey.get(item.key);
    if (!existing || (existing.lang !== lang && item.lang === lang)) byKey.set(item.key, item);
  }
  return [...byKey.values()].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
}

export async function getTranslation(item: Item, target: Lang = otherLang(item.lang)): Promise<Item | undefined> {
  return (await getItems(item.kind)).find((i) => i.key === item.key && i.lang === target);
}

/** Helper cho getStaticPaths của trang chi tiết. */
export async function entryPaths(kind: Kind, lang: Lang) {
  const items = await getItemsByLang(kind, lang);
  return items.map((item) => ({ params: { slug: item.slug }, props: { item } }));
}

/** Tìm bài theo tham chiếu "work/aeroeyes" (ưu tiên đúng ngôn ngữ). */
export async function resolveRef(ref: string, lang: Lang): Promise<Item | undefined> {
  const [kind, ...rest] = ref.split('/');
  if (!KINDS.includes(kind as Kind)) return undefined;
  const slug = rest.join('/');
  const items = await getItems(kind as Kind);
  const matches = items.filter((i) => i.slug === slug || i.key === `${kind}:${slug}`);
  return matches.find((i) => i.lang === lang) ?? matches[0];
}

/** Các đường dẫn mục theo từng loại — để nhận diện link nội bộ trong nội dung. */
const KIND_PATHS: Record<string, Kind> = {
  'cau-chuyen': 'stories',
  'cong-viec': 'work',
  'ghi-chep': 'notes',
  'en/stories': 'stories',
  'en/work': 'work',
  'en/notes': 'notes',
};
const LINK_RE = /\]\(\s*\/((?:en\/)?(?:cau-chuyen|cong-viec|ghi-chep|stories|work|notes))\/([a-z0-9-]+)\/?[^)]*\)|href=["']\/((?:en\/)?(?:cau-chuyen|cong-viec|ghi-chep|stories|work|notes))\/([a-z0-9-]+)/g;

const outgoingCache = new Map<string, Promise<Set<string>>>();

/** Các bài mà `item` liên kết tới (qua link trong nội dung và trường `related`), dạng key. */
export function outgoingKeys(item: Item): Promise<Set<string>> {
  const cacheKey = `${item.kind}/${item.id}`;
  if (!outgoingCache.has(cacheKey)) outgoingCache.set(cacheKey, computeOutgoing(item));
  return outgoingCache.get(cacheKey)!;
}

async function computeOutgoing(item: Item): Promise<Set<string>> {
  const keys = new Set<string>();
  const all = await getAllItems();
  for (const m of item.body.matchAll(LINK_RE)) {
    const section = m[1] ?? m[3];
    const slug = m[2] ?? m[4];
    const kind = KIND_PATHS[section!];
    if (!kind) continue;
    const lang: Lang = section!.startsWith('en/') ? 'en' : 'vi';
    const target = all.find((i) => i.kind === kind && i.slug === slug && i.lang === lang);
    if (target && target.key !== item.key) keys.add(target.key);
  }
  for (const ref of item.related) {
    const target = await resolveRef(ref, item.lang);
    if (target && target.key !== item.key) keys.add(target.key);
  }
  return keys;
}

/** "Được nhắc đến trong": các bài (ưu tiên cùng ngôn ngữ) có link tới `item`. */
export async function getBacklinks(item: Item): Promise<Item[]> {
  const merged = await getMergedItems(item.lang);
  const out: Item[] = [];
  for (const other of merged) {
    if (other.key === item.key) continue;
    const keys = await outgoingKeys(other);
    if (keys.has(item.key)) out.push(other);
  }
  return out;
}

/** Bài liên quan: `related` + cùng tag, loại trừ chính nó và backlinks. */
export async function getRelated(item: Item, exclude: Set<string> = new Set(), limit = 3): Promise<Item[]> {
  const merged = await getMergedItems(item.lang);
  const explicit = await outgoingKeys(item);
  const scored = merged
    .filter((o) => o.key !== item.key && !exclude.has(o.key))
    .map((o) => {
      const shared = o.tags.filter((t) => item.tags.includes(t)).length;
      const score = (explicit.has(o.key) ? 10 : 0) + shared * 2 + (o.kind === item.kind ? 0.5 : 0);
      return { o, score };
    })
    .filter((x) => x.score > 0.5)
    .sort((a, b) => b.score - a.score || b.o.sortDate.getTime() - a.o.sortDate.getTime());
  return scored.slice(0, limit).map((x) => x.o);
}

/** Bài trước / sau trong cùng loại & ngôn ngữ. */
export async function getNeighbors(item: Item): Promise<{ prev?: Item; next?: Item }> {
  const list = (await getItemsByLang(item.kind, item.lang)).slice().sort((a, b) => a.date.getTime() - b.date.getTime());
  const i = list.findIndex((x) => x.id === item.id);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}

/**
 * Các bài cùng series (cùng loại, cùng ngôn ngữ) — rỗng nếu bài không thuộc series nào.
 * Xếp theo `part` nếu có (bài không ghi `part` đứng sau), rồi theo ngày.
 */
export async function getSeries(item: Item): Promise<Item[]> {
  type SeriesData = { series?: string; part?: number };
  const series = (item.entry.data as SeriesData).series;
  if (!series) return [];
  const part = (i: Item) => (i.entry.data as SeriesData).part ?? Number.POSITIVE_INFINITY;
  return (await getItemsByLang(item.kind, item.lang))
    .filter((i) => (i.entry.data as SeriesData).series === series)
    .sort((a, b) => {
      const pa = part(a);
      const pb = part(b);
      if (pa !== pb) return pa < pb ? -1 : 1;
      return a.date.getTime() - b.date.getTime();
    });
}

/** Tất cả tag (theo ngôn ngữ đã gộp) với số bài. */
export async function getTags(lang: Lang): Promise<{ tag: string; slug: string; count: number; items: Item[] }[]> {
  const merged = await getMergedItems(lang);
  const map = new Map<string, { tag: string; slug: string; count: number; items: Item[] }>();
  for (const item of merged) {
    for (const tag of item.tags) {
      const slug = tagSlug(tag);
      const e = map.get(slug) ?? { tag, slug, count: 0, items: [] };
      e.count++;
      e.items.push(item);
      // Ưu tiên cách viết của bài cùng ngôn ngữ
      if (item.lang === lang) e.tag = tag;
      map.set(slug, e);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'vi'));
}

// ---------- Hành trình ----------

export type JourneyKind = CollectionEntry<'journey'>['data']['kind'];

export interface Milestone {
  id: string;
  date: Date;
  precision: 'day' | 'month' | 'year';
  kind: JourneyKind;
  title: string;
  description?: string;
  link?: string;
  /** `link` đã xử lý: có base path, và link tới bài viết được đổi sang bản cùng ngôn ngữ trang nếu có */
  href?: string;
  /** true nếu `href` dẫn ra ngoài site */
  external?: boolean;
  draft: boolean;
  /** true nếu cột mốc được tạo tự động từ một dự án */
  auto?: boolean;
}

export async function getMilestones(lang: Lang): Promise<Milestone[]> {
  const entries = await getCollection('journey');
  const milestones: Milestone[] = entries
    .map((e) => ({
      id: e.id,
      date: e.data.date.value,
      precision: e.data.precision ?? e.data.date.precision,
      kind: e.data.kind,
      title: (lang === 'en' ? e.data.title.en : undefined) ?? e.data.title.vi,
      description: (lang === 'en' ? e.data.description.en : undefined) ?? e.data.description.vi,
      link: e.data.link,
      href: undefined as string | undefined,
      draft: e.data.draft,
    }))
    .filter((m) => SHOW_DRAFTS || !m.draft);

  // Tự thêm các dự án như những cột mốc (nếu chưa có cột mốc nào trỏ tới dự án đó)
  const linked = new Set(milestones.map((m) => m.link?.replace(/\/$/, '')));
  const work = await getMergedItems(lang, ['work']);
  for (const w of work) {
    const path = `/${w.lang === 'en' ? 'en/work' : 'cong-viec'}/${w.slug}`;
    const altPath = `/${w.lang === 'en' ? 'cong-viec' : 'en/work'}/${w.slug}`;
    if (linked.has(path) || linked.has(altPath)) continue;
    milestones.push({
      id: `auto-${w.key}`,
      date: w.date,
      precision: ((w.entry.data as any).periodPrecision ?? 'month') as Milestone['precision'],
      kind: (w.entry.data as any).category === 'cuoc-thi' ? 'cuoc-thi' : 'du-an',
      title: w.title,
      description: w.description,
      link: w.url,
      href: w.url,
      draft: w.draft,
      auto: true,
    });
  }
  for (const m of milestones) {
    m.href ??= await localHref(m.link, lang);
    m.external = !!m.href && /^https?:/.test(m.href);
  }
  return milestones.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Link do người viết khai báo (journey.yaml) → href dùng được trong trang `lang`.
 * `/cong-viec/aeroeyes` trên trang tiếng Anh sẽ thành `/en/work/aeroeyes/` nếu bài đã có bản dịch.
 */
async function localHref(link: string | undefined, lang: Lang): Promise<string | undefined> {
  if (!link) return undefined;
  if (/^(https?:|mailto:)/.test(link)) return link;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = base && (link === base || link.startsWith(base + '/')) ? link.slice(base.length) || '/' : link;
  const m = path.match(/^\/((?:en\/)?[a-z-]+)\/([a-z0-9-]+)\/?$/);
  const kind = m ? KIND_PATHS[m[1]] : undefined;
  if (kind) {
    const target = await resolveRef(`${kind}/${m![2]}`, lang);
    if (target) return target.url;
  }
  return url(path);
}

// ---------- Now ----------

export async function getNowEntries(lang: Lang) {
  const entries = (await getCollection('now'))
    .filter((e) => SHOW_DRAFTS || !e.data.draft)
    .map((e) => ({ ...parseId(e.id), entry: e }));
  const forLang = entries.filter((e) => e.lang === lang);
  const list = forLang.length ? forLang : entries.filter((e) => e.lang === 'vi');
  return list.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

/** Tóm tắt một đoạn Markdown thành văn bản thuần (cho dải "Bây giờ" ở trang chủ). */
export function plainExcerpt(md: string, max = 220): string {
  const text = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^#+\s.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/^\s*[-+]\s+/gm, '· ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^·\s*/, '');
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}
