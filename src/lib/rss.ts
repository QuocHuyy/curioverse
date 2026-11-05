import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '~/site.config';
import { LOCALES, t, type Lang } from '~/i18n/utils';
import { getAllItems } from './content';

export async function buildFeed(context: APIContext, lang: Lang) {
  const tr = t(lang);
  const items = (await getAllItems()).filter((i) => i.lang === lang && !i.draft);
  return rss({
    title: `${SITE.name} — ${SITE.tagline[lang]}`,
    description: SITE.description[lang],
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: items.map((i) => ({
      title: i.title,
      description: i.description,
      pubDate: i.date,
      link: new URL(i.url, context.site).href,
      categories: [tr(`kind.${i.kind}.one`), ...i.tags],
    })),
    customData: `<language>${LOCALES[lang]}</language>`,
    trailingSlash: true,
  });
}
