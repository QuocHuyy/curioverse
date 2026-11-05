// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeBaseLinks } from './plugins/rehype-base-links.mjs';
import { remarkHasMath } from './plugins/remark-has-math.mjs';

/**
 * Địa chỉ website.
 * - Mặc định: GitHub Pages của repo → https://quochuyy.github.io/curioverse/
 * - Khi có tên miền riêng: đặt biến SITE_URL=https://ten-mien-cua-ban và BASE_PATH=/
 *   (trong GitHub: Settings → Secrets and variables → Actions → Variables), hoặc sửa 2 dòng dưới.
 */
const SITE = process.env.SITE_URL || 'https://quochuyy.github.io';
const BASE = process.env.BASE_PATH || '/curioverse';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/og/'),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
    },
    // Astro 7 mặc định dùng Sätteri; dùng unified() để chạy remark/rehype (công thức toán, link có base)
    processor: unified({
      remarkPlugins: [remarkMath, remarkHasMath],
      rehypePlugins: [rehypeKatex, [rehypeBaseLinks, { base: BASE }]],
    }),
  },
  devToolbar: { enabled: false },
});
