import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllItems } from '~/lib/content';
import { renderOg } from '~/lib/og';
import { SITE } from '~/site.config';
import { t, type Lang } from '~/i18n/utils';

const host = () => new URL(import.meta.env.BASE_URL, import.meta.env.SITE).href.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const getStaticPaths = (async () => {
  const items = await getAllItems();
  const entries = items.map((item) => ({
    params: { path: `${item.kind}/${item.lang}/${item.slug}` },
    props: {
      title: item.title,
      description: item.description,
      label: t(item.lang)(`kind.${item.kind}.one`),
      seed: item.key,
      kind: item.kind,
      lang: item.lang,
    },
  }));
  const defaults = (['vi', 'en'] as Lang[]).map((lang) => ({
    params: { path: `default/${lang}` },
    props: {
      title: SITE.tagline[lang],
      description: SITE.description[lang],
      label: SITE.name,
      seed: 'curioverse',
      kind: 'default' as const,
      lang,
    },
  }));
  return [...entries, ...defaults];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const p = props as { title: string; description: string; label: string; seed: string; kind: 'stories' | 'work' | 'notes' | 'default'; lang: Lang };
  const png = await renderOg({ ...p, footer: `${SITE.author} · ${host()}` });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
