#!/usr/bin/env node
/**
 * Tạo bài mới với frontmatter mẫu.
 *
 *   pnpm new story "Tiêu đề câu chuyện"
 *   pnpm new work  "Tên dự án"
 *   pnpm new note  "Tên ghi chép"
 *   pnpm new now
 *   thêm --en để tạo bản tiếng Anh (thư mục en/)
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);
const en = args.includes('--en');
const [type, ...titleParts] = args.filter((a) => a !== '--en');
const title = titleParts.join(' ').trim();
const lang = en ? 'en' : 'vi';
const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const q = (s) => `'${s.replace(/'/g, "''")}'`;

const templates = {
  story: () => ({
    dir: 'stories',
    body: `---
title: ${q(title)}
description: ${q('Một câu tóm tắt bài viết.')}
date: ${today}
tags: []
draft: true
---

<Prompt>Bắt đầu bằng một khoảnh khắc cụ thể. Viết thật, đừng cố viết hay.</Prompt>
`,
  }),
  work: () => ({
    dir: 'work',
    body: `---
title: ${q(title)}
description: ${q('Một câu mô tả dự án.')}
role: ${q('Vai trò của bạn')}
period:
  start: '${today.slice(0, 7)}'
periodPrecision: month
published: ${today} # ngày đăng bài này (khác ngày bắt đầu dự án)
status: dang-lam # dang-lam | hoan-thanh | luu-tru
category: du-an # nghien-cuu | cuoc-thi | du-an | hoc-tap
stack: []
links: {}
highlights: []
tags: []
draft: true
---

## Bối cảnh

## Bài toán

## Cách tiếp cận

## Kết quả

## Điều mình học được
`,
  }),
  note: () => ({
    dir: 'notes',
    body: `---
title: ${q(title)}
description: ${q('Ghi chép này nói về điều gì?')}
stage: nebula # nebula (Tinh vân) → protostar (Tiền sao) → star (Ngôi sao)
planted: ${today}
tags: []
draft: true
---

Ý tưởng còn thô…
`,
  }),
  now: () => ({
    dir: 'now',
    slug: today.slice(0, 7),
    body: `---
date: ${today}
---

- Đang làm:
- Đang học:
- Đang đọc:
`,
  }),
};

if (!templates[type] || (type !== 'now' && !title)) {
  console.log('Cách dùng: pnpm new <story|work|note|now> "Tiêu đề" [--en]');
  process.exit(1);
}
const t = templates[type]();
const slug = t.slug ?? slugify(title);
if (!slug) {
  console.error('Tiêu đề không có chữ cái Latin nào để tạo tên file. Thử một tiêu đề khác, ví dụ: pnpm new story "Ten bai"');
  process.exit(1);
}
const ext = type === 'now' ? 'md' : 'mdx';
const file = join(process.cwd(), 'src', 'content', t.dir, lang, `${slug}.${ext}`);
if (existsSync(file)) {
  console.error(`Đã có file: ${file}`);
  process.exit(1);
}
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, t.body);
console.log(`✦ Đã tạo ${file.replace(process.cwd() + '/', '')}`);
