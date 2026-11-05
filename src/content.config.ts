import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Ngày linh hoạt: chấp nhận 2025, "2025", "2025-09", "2025-09-14" hoặc Date.
 * (YAML hiểu `2025` là số, nên cần xử lý riêng.)
 */
const flexibleDate = z
  .union([z.number(), z.string(), z.date()])
  .transform((v, ctx) => {
    const d =
      v instanceof Date
        ? v
        : typeof v === 'number'
          ? new Date(`${v}-01-01T00:00:00Z`)
          : new Date(/^\d{4}$/.test(v) ? `${v}-01-01T00:00:00Z` : /^\d{4}-\d{2}$/.test(v) ? `${v}-01T00:00:00Z` : v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: 'custom', message: `Ngày không hợp lệ: ${String(v)}` });
      return z.NEVER;
    }
    return d;
  });

const precision = z.enum(['day', 'month', 'year']);

/** Như flexibleDate nhưng giữ lại độ chính xác (năm / tháng / ngày) suy ra từ cách viết. */
const datedWithPrecision = z.union([z.number(), z.string(), z.date()]).transform((v, ctx) => {
  const raw = v instanceof Date ? null : String(v);
  const p: 'day' | 'month' | 'year' = raw && /^\d{4}$/.test(raw) ? 'year' : raw && /^\d{4}-\d{2}$/.test(raw) ? 'month' : 'day';
  const d =
    v instanceof Date
      ? v
      : new Date(p === 'year' ? `${raw}-01-01T00:00:00Z` : p === 'month' ? `${raw}-01T00:00:00Z` : String(v));
  if (Number.isNaN(d.getTime())) {
    ctx.addIssue({ code: 'custom', message: `Ngày không hợp lệ: ${String(v)}` });
    return z.NEVER;
  }
  return { value: d, precision: p };
});

/** Các trường chung của mọi bài viết. */
const base = z.object({
  title: z.string(),
  /** Một câu tóm tắt — hiện trên thẻ bài, trong kết quả tìm kiếm và ảnh chia sẻ. */
  description: z.string(),
  tags: z.array(z.string()).default([]),
  /** Bài liên quan, dạng "work/aeroeyes" hoặc "notes/phep-quay-4d". */
  related: z.array(z.string()).default([]),
  /** Ghép cặp bản dịch. Mặc định: cùng tên file ở thư mục vi/ và en/. */
  translationKey: z.string().optional(),
  /** `true` = chỉ hiện khi chạy dev (có nhãn "Nháp"), không lên site thật. */
  draft: z.boolean().default(false),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/stories' }),
  schema: base.extend({
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    series: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: base.extend({
    role: z.string(),
    period: z.object({
      start: flexibleDate,
      end: flexibleDate.optional(),
    }),
    periodPrecision: precision.default('month'),
    /** Ngày đăng bài viết về dự án (khác ngày bắt đầu dự án). Dùng cho RSS và dữ liệu cấu trúc. */
    published: z.coerce.date().optional(),
    status: z.enum(['dang-lam', 'hoan-thanh', 'luu-tru']),
    category: z.enum(['nghien-cuu', 'cuoc-thi', 'du-an', 'hoc-tap']),
    stack: z.array(z.string()).default([]),
    links: z
      .object({
        repo: z.url().optional(),
        demo: z.url().optional(),
        paper: z.url().optional(),
      })
      .default({}),
    highlights: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    /** Số nhỏ hơn xếp trước. */
    order: z.number().default(100),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: base.extend({
    /** Độ chín: nebula (Tinh vân) → protostar (Tiền sao) → star (Ngôi sao). */
    stage: z.enum(['nebula', 'protostar', 'star']),
    planted: z.coerce.date(),
    tended: z.coerce.date().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/now' }),
  schema: z.object({
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date().optional(),
  }),
});

const journey = defineCollection({
  loader: file('src/content/journey.yaml'),
  schema: z.object({
    /** Viết "2025" (chỉ năm), "2025-09" (tháng) hoặc 2025-09-14 (ngày). */
    date: datedWithPrecision,
    precision: precision.optional(),
    kind: z.enum(['hoc-tap', 'cong-viec', 'cuoc-thi', 'chung-chi', 'du-an', 'cot-moc']),
    title: z.object({ vi: z.string(), en: z.string().optional() }),
    description: z.object({ vi: z.string().optional(), en: z.string().optional() }).default({}),
    /** Link nội bộ (/cong-viec/aeroeyes) hoặc link ngoài. */
    link: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { stories, work, notes, now, pages, journey };
