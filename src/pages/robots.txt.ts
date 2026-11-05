import type { APIRoute } from 'astro';

/**
 * robots.txt sinh lúc build để luôn trỏ đúng sitemap theo SITE_URL / BASE_PATH.
 * Lưu ý: trên GitHub Pages dạng project (…github.io/curioverse/), trình thu thập chỉ đọc robots.txt
 * ở gốc tên miền, nên file này chỉ thật sự có tác dụng khi dùng tên miền riêng (BASE_PATH=/).
 * Sitemap vẫn được khai báo trong <head> của mọi trang.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
