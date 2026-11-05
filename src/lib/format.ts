import { formatDate, t, type Lang } from '~/i18n/utils';

/** "tháng 1 năm 2026 – nay" · "2025" · "3/2024 – 6/2024" */
export function formatPeriod(
  data: { period: { start: Date; end?: Date }; periodPrecision?: 'day' | 'month' | 'year'; status?: string },
  lang: Lang,
): string {
  const p = data.periodPrecision ?? 'month';
  const start = formatDate(data.period.start, lang, p);
  if (data.period.end) {
    const end = formatDate(data.period.end, lang, p);
    return end === start ? start : `${start} – ${end}`;
  }
  return data.status === 'dang-lam' ? `${start} – ${t(lang)('meta.present')}` : start;
}

/**
 * JSON an toàn để nhúng trong `<script>` (JSON-LD, dữ liệu cho bản đồ sao).
 * Thoát `<` để một tiêu đề có chuỗi như "</script>" không cắt ngang thẻ script.
 */
export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
