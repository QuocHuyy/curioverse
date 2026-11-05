#!/usr/bin/env node
/**
 * Kiểm tra link nội bộ trong dist/: báo link hỏng và link thiếu base path.
 * Chạy sau khi build:  pnpm build && pnpm check:links
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const BASE = (process.env.BASE_PATH || '/curioverse').replace(/\/$/, '');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

function targetExists(pathname) {
  let p = decodeURIComponent(pathname);
  if (BASE) {
    if (!(p === BASE || p.startsWith(BASE + '/'))) return 'missing-base';
    p = p.slice(BASE.length) || '/';
  }
  const file = join(DIST, p);
  if (p.endsWith('/')) return existsSync(join(file, 'index.html')) ? 'ok' : 'broken';
  if (existsSync(file)) return 'ok';
  if (existsSync(join(file, 'index.html'))) return 'ok';
  return 'broken';
}

if (!existsSync(DIST) || !(await stat(DIST)).isDirectory()) {
  console.error('Chưa có thư mục dist/. Chạy `pnpm build` trước.');
  process.exit(1);
}

const problems = [];
let pages = 0;
let links = 0;
const ATTR = /\s(?:href|src)=["']([^"'#?]*)(?:[#?][^"']*)?["']/g;
for await (const file of walk(DIST)) {
  pages++;
  const html = await readFile(file, 'utf8');
  for (const m of html.matchAll(ATTR)) {
    const raw = m[1];
    if (!raw || !raw.startsWith('/') || raw.startsWith('//')) continue;
    links++;
    const status = targetExists(raw);
    if (status !== 'ok') problems.push({ page: relative(DIST, file), link: raw, status });
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} link nội bộ có vấn đề (trên ${links} link, ${pages} trang):`);
  for (const p of problems) console.error(`  [${p.status}] ${p.page} → ${p.link}`);
  process.exit(1);
}
console.log(`✓ ${links} link nội bộ trên ${pages} trang đều ổn.`);
