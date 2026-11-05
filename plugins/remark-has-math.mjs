// @ts-check
/**
 * Remark plugin: đánh dấu bài có công thức toán (nút `math` / `inlineMath` do remark-math tạo ra)
 * vào `remarkPluginFrontmatter.hasMath`, để trang chỉ nạp CSS của KaTeX khi thật sự cần.
 * Dựa vào cây cú pháp thay vì đoán bằng regex, nên khớp đúng với cách remark-math hiểu `$…$`.
 */

/** @param {any} node */
const hasMath = (node) =>
  node.type === 'math' || node.type === 'inlineMath' || (Array.isArray(node.children) && node.children.some(hasMath));

export function remarkHasMath() {
  return (/** @type {any} */ tree, /** @type {any} */ file) => {
    const astro = (file.data.astro ??= {});
    const frontmatter = (astro.frontmatter ??= {});
    frontmatter.hasMath = hasMath(tree);
  };
}
