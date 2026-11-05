import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '~/site.config';
import { LOCALES, t, type Lang } from '~/i18n/utils';
import { getAllItems } from './content';

export async function buildFeed(context: APIContext, lang: Lang) {
  const tr = t(lang);
  const items = (await getAllItems()).filter((i) => i.lang === lang && !i.draft);
  const self = new URL(context.url.pathname, context.site).href;
  return rss({
    title: `${SITE.name} — ${SITE.tagline[lang]}`,
    description: SITE.description[lang],
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: items.map((i) => ({
      title: i.title,
      description: i.description,
      // Dự án: `date` là ngày bắt đầu dự án (có khi nhiều năm trước) → dùng ngày đăng để trình đọc RSS không xếp vào bài cũ
      pubDate: i.published,
      link: new URL(i.url, context.site).href,
      categories: [tr(`kind.${i.kind}.one`), ...i.tags],
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${LOCALES[lang]}</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    trailingSlash: true,
  });
}
