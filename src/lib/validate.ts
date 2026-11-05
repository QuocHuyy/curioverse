/**
 * Kiểm tra nội dung lúc build — bắt những lỗi mà schema frontmatter không thấy được.
 * - Lỗi (dừng build, chỉ cảnh báo khi dev): `related` trỏ tới bài không tồn tại; hai bài cùng ngôn ngữ trùng khoá ghép cặp.
 * - Cảnh báo: nhiều cách viết khác nhau của cùng một chủ đề (sẽ bị gộp thành một trang chủ đề).
 * Bài nháp vẫn được tính là "tồn tại": bài đã đăng được phép liên quan tới bài còn nháp (cạnh chỉ hiện khi bài kia đăng).
 */
import { getCollection } from 'astro:content';
import { tagSlug } from '~/i18n/utils';
import type { Item, Kind } from './content';

const KINDS: Kind[] = ['stories', 'work', 'notes'];

export async function validateContent(items: Item[]): Promise<void> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Mọi bài, kể cả nháp: "kind/slug" và "kind:translationKey"
  const known = new Set<string>();
  for (const kind of KINDS) {
    for (const e of await getCollection(kind)) {
      const slug = e.id.replace(/^(vi|en)\//, '');
      known.add(`${kind}/${slug}`);
      const tk = (e.data as { translationKey?: string }).translationKey;
      if (tk) known.add(`${kind}/${tk}`);
    }
  }

  const where = (i: Item) => i.entry.filePath ?? `${i.kind}/${i.id}`;

  for (const item of items) {
    for (const ref of item.related) {
      const kind = ref.split('/')[0] as Kind;
      if (!KINDS.includes(kind)) {
        errors.push(`${where(item)}: related "${ref}" phải có dạng "stories/…", "work/…" hoặc "notes/…".`);
      } else if (!known.has(ref)) {
        errors.push(`${where(item)}: related "${ref}" không trỏ tới bài nào (gõ nhầm tên file?).`);
      }
    }
  }

  // Trùng khoá ghép cặp trong cùng một ngôn ngữ → một trong hai bài sẽ bị "nuốt" ở bản đồ sao, chủ đề, bản dịch
  const byLangKey = new Map<string, Item>();
  for (const item of items) {
    const k = `${item.lang}|${item.key}`;
    const other = byLangKey.get(k);
    if (other) errors.push(`${where(item)} và ${where(other)} có cùng khoá ghép cặp "${item.key}" (kiểm tra translationKey).`);
    else byLangKey.set(k, item);
  }

  // Nhiều cách viết của một chủ đề (khác nhau không chỉ ở hoa/thường)
  const spellings = new Map<string, Set<string>>();
  for (const item of items) {
    for (const tag of item.tags) {
      const s = tagSlug(tag);
      (spellings.get(s) ?? spellings.set(s, new Set()).get(s)!).add(tag);
    }
  }
  for (const [slug, set] of spellings) {
    const distinct = new Set([...set].map((t) => t.normalize('NFC').toLowerCase()));
    if (distinct.size > 1) warnings.push(`các tag ${[...set].map((t) => `"${t}"`).join(', ')} đều thành chủ đề /${slug}/ — nên thống nhất một cách viết.`);
  }

  for (const w of warnings) console.warn(`[curioverse] ${w}`);
  if (!errors.length) return;
  const message = `[curioverse] Nội dung có ${errors.length} lỗi:\n  - ${errors.join('\n  - ')}`;
  if (import.meta.env.DEV) console.warn(message);
  else throw new Error(message);
}
