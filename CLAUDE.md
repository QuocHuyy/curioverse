# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Curioverse is a bilingual (Vietnamese primary, English optional) personal website built as a fully static Astro 7 site, deployed to GitHub Pages at `https://quochuyy.github.io/curioverse/`. Code comments, docs, commit messages and UI strings are written in Vietnamese; follow that convention.

Background docs: `docs/y-tuong.md` (vision/direction), `docs/huong-dan-viet.md` (authoring guide, frontmatter reference for every collection).

## Commands

Node ≥ 22.23.4 (see `.node-version`), pnpm 10.

```bash
pnpm dev                 # http://localhost:4321/curioverse/ — drafts visible
pnpm build               # astro build && pagefind --site dist
pnpm preview
pnpm check               # astro check: TypeScript + content frontmatter schema validation
pnpm check:links         # scans dist/ for broken internal links and links missing the base path (run after build)
pnpm new <story|work|note|now> "Title" [--en]   # scaffolds a draft with frontmatter in src/content/<kind>/<lang>/
PUBLIC_SHOW_DRAFTS=true pnpm build              # production build that includes drafts
```

There is no test suite or linter. CI (`.github/workflows/deploy.yml`, runs on PRs and `main`) does `pnpm check` → `pnpm build` → `pnpm check:links`; all three must pass. Search (Pagefind) only works against a build (`pnpm build && pnpm preview`), not in `pnpm dev`.

## Architecture

### Base path is everywhere
The site is served under `base: '/curioverse'` with `trailingSlash: 'always'` (overridable via `SITE_URL` / `BASE_PATH` env vars in `astro.config.mjs`). Never hard-code internal hrefs in components:
- In `.astro`/`.ts` code, build links with `url()` / `sectionUrl()` from `src/i18n/utils.ts` (adds base + trailing slash).
- In Markdown/MDX content, authors write bare paths like `/ghi-chep/abc`; `plugins/rehype-base-links.mjs` rewrites them at build time (and marks external links with `rel` + `.external`).
- `scripts/check-links.mjs` flags any link that slipped through without the base.

### i18n and routing
- Section → path mapping lives in `SECTIONS` in `src/i18n/utils.ts` (e.g. `stories` = `/cau-chuyen` in vi, `/en/stories` in en). UI strings are in `src/i18n/ui.ts`, accessed via `t(lang)(key)`.
- Vietnamese routes live at the root of `src/pages/` (Vietnamese slugs: `cau-chuyen`, `cong-viec`, `ghi-chep`, `hanh-trinh`, `ban-do-sao`, `gioi-thieu`, `chu-de`); English routes mirror them under `src/pages/en/`.
- Route files are thin: they call a `getStaticPaths` helper and render a shared view from `src/views/` with a `lang`/`item` prop. Put page logic in the view, not the route, so both languages stay in sync. Adding a section means adding to `SECTIONS`, both route files, and a view.

### Content model (`src/content.config.ts`, `src/lib/content.ts`)
- Collections: `stories`, `work`, `notes` (the three "kinds" of posts), plus `now`, `pages`, and `journey` (single YAML file, `file()` loader). Post files live at `src/content/<kind>/<vi|en>/<slug>.mdx`; the language comes from the folder (`parseId`).
- `src/lib/content.ts` normalizes every post into an `Item` (unified `date`/`sortDate`, `url`, `readingMinutes`, `key`). Always go through `getItems` / `getListing` / `getMergedItems` rather than `getCollection` directly — they handle draft filtering (`SHOW_DRAFTS` = dev or `PUBLIC_SHOW_DRAFTS`) and sorting.
- UI strings that describe a post's language are keyed by that language (`lang.only.<lang>`, `lang.otherGroup.<lang>`); the VI/EN switch reads `lang.switchTo` / `lang.noCounterpart` from the *target* language's dictionary.
- Translations are paired by `key` = `${kind}:${translationKey ?? slug}`, so vi/en files with the same filename are automatically linked. `getMergedItems(lang)` yields one item per work, preferring `lang` and falling back to the other language; listing pages show untranslated posts from the other language as a fallback group.
- Cross-post links: `outgoingKeys` collects links from both the `related` frontmatter (`"work/aeroeyes"`) and internal markdown links in the body (regex `LINK_RE`). This powers backlinks, related posts, and the graph edges — if you add a new section that posts can link to, update `KIND_PATHS`/`LINK_RE`.
- Tag URLs use `tagSlug()` (not `slugify`): `C++` → `c-plus-plus`, `C#` → `c-sharp`, symbol-only tags → `tag-<hash>`. Use it anywhere tags become slugs or graph cluster ids.
- `src/lib/validate.ts` runs once per build (via `getAllItems`): it throws on `related` refs that point to no file (drafts count as existing) and on duplicate pairing keys within one language, and warns when different tag spellings collapse into one topic. In dev it only warns.
- `work` has an optional `published` date (when the case study was posted, as opposed to `period.start`); `Item.published` feeds RSS `pubDate` and JSON-LD/`article:published_time`.
- Stories with the same `series` (same language) get a series box with part numbers (`getSeries`).
- `getMilestones` merges `journey.yaml` entries with auto-generated milestones from `work` items not already linked from the journey, and resolves each `link` into `href` (base path added; internal post links switched to the page language's translation when one exists).
- Dates in `work.period` and `journey` accept `2025`, `"2025-09"` or a full date; precision is inferred and used for display.
- `Figure` takes either an imported image (`import x from './img.png'` → optimized via `astro:assets`) or a `/public` path string. KaTeX CSS is only linked on posts that contain math: `plugins/remark-has-math.mjs` sets `remarkPluginFrontmatter.hasMath`, read in `EntryView`.
- MDX posts get `Callout`, `Figure`, `Sidenote`, `Prompt` without imports (`src/components/mdx/index.ts`, passed in `EntryView`). `<Prompt>` is an authoring hint shown only in dev; the build warns if a published post still contains one.

### Build-time generated visuals
Everything is computed at build time; the client ships only small scripts.
- **Universe map** (`/ban-do-sao`): `src/lib/graph.ts` runs a seeded d3-force simulation per language at build and renders static SVG; `src/components/universe/universe-client.ts` adds pan/zoom/hover/filter on the client.
- **Sigils** (per-post constellations): `src/lib/sigil.ts`, deterministic from a hash of the post key (FNV-1a + mulberry32). Also reused as the seed source in the graph.
- **Pixel art** (icons, mascot "Curio", skyline, brand mark): drawn in code via `src/lib/pixel.ts` (grid cells merged into SVG paths), `pixel-icons.ts`, `mascot.ts`, `skyline.ts`, `brand.ts`.
- **OG images**: `src/pages/og/[...path].png.ts` → `src/lib/og.ts` renders 1200×630 PNGs with satori + sharp for every post and per-language defaults. Satori needs TTF fonts, which is why `src/assets/og-fonts/` exists separately from the Fontsource web fonts.

### Styling and theme
Plain CSS, no framework. Design tokens in `src/styles/tokens.css` (light = "pixel notebook under blue sky", dark = "lo-fi starry night"), global/pixel-frame styles in `global.css`, article typography in `prose.css`. Theme is `data-theme` on `<html>`, set by an inline script in `BaseLayout.astro` from localStorage or `prefers-color-scheme`. Shiki uses dual themes with `defaultColor: false`, so code colors come from CSS variables.

### Search
Pagefind indexes `dist/` after the Astro build. Use `data-pagefind-body` / `data-pagefind-meta` / `data-pagefind-ignore` to control what's indexed. `SearchDialog.astro` lazy-loads `${base}/pagefind/pagefind.js`. Accent-insensitive matching comes from Pagefind itself (it strips combining marks, so `vu tru` finds `vũ trụ`, but `đ` is a separate letter: `do thi` does not match `đồ thị`). Pagefind indexes per `<html lang>`, so search on EN pages only covers EN pages. `fold()` in `src/i18n/utils.ts` is used by the star-map filter, not by site search.

### Site config
`src/site.config.ts` is the single source for name, author, taglines, socials, repo link (used by the "edit this post" button). Items marked `TODO` are intentionally left for the owner to fill in.
