// @ts-check
/**
 * Rehype plugin: thêm `base` (ví dụ `/curioverse`) vào các link nội bộ viết trong Markdown.
 *
 * Trong bài viết, bạn chỉ cần viết `/ghi-chep/abc` — plugin sẽ đổi thành
 * `/curioverse/ghi-chep/abc/` khi build. Link ngoài được gắn rel an toàn và class `external`.
 */

/** @param {string} path */
const hasExtension = (path) => /\.[a-z0-9]+$/i.test(path.split('/').pop() ?? '');

/**
 * @param {string} href
 * @param {string} base  base không có dấu `/` ở cuối, ví dụ '/curioverse' hoặc ''
 */
export function withBase(href, base) {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  let path = match?.[1] ?? href;
  const rest = match?.[2] ?? '';
  if (base && (path === base || path.startsWith(base + '/'))) return href;
  if (!hasExtension(path) && !path.endsWith('/')) path += '/';
  return `${base}${path}${rest}`;
}

/** @param {{ base?: string }} [options] */
export function rehypeBaseLinks(options = {}) {
  const base = (options.base ?? '').replace(/\/$/, '');
  /** @param {any} node */
  const visit = (node) => {
    if (node.type === 'element') {
      const props = node.properties ?? {};
      if (node.tagName === 'a' && typeof props.href === 'string') {
        if (/^https?:\/\//.test(props.href)) {
          props.rel = ['noopener', 'noreferrer'];
          const cls = Array.isArray(props.className) ? props.className : [];
          props.className = [...cls, 'external'];
        } else {
          props.href = withBase(props.href, base);
        }
      }
      if ((node.tagName === 'img' || node.tagName === 'source') && typeof props.src === 'string') {
        props.src = withBase(props.src, base);
      }
    }
    if (Array.isArray(node.children)) node.children.forEach(visit);
  };
  return (/** @type {any} */ tree) => visit(tree);
}
