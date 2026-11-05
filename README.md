# ✦ Curioverse

**Vũ trụ tò mò của Huy.** Website cá nhân để kể chuyện, chia sẻ công việc và ghi lại hành trình phát triển. Mỗi bài viết là một ngôi sao.

- Ý tưởng và định hướng: [`docs/y-tuong.md`](docs/y-tuong.md)
- Cách viết bài: [`docs/huong-dan-viet.md`](docs/huong-dan-viet.md)

## Có gì bên trong

| | |
| --- | --- |
| **Câu chuyện · Công việc · Hành trình · Ghi chép** | Bốn trụ nội dung, viết bằng Markdown/MDX |
| **Bản đồ sao** | Đồ thị tương tác của mọi bài viết (d3-force tính lúc build, SVG + một script nhỏ) |
| **Chòm sao riêng** | Mỗi bài có một hình chòm sao sinh tự động, cố định theo tên bài |
| **Độ chín ghi chép** | Tinh vân → Tiền sao → Ngôi sao |
| **Pixel + Anime** | Khung cửa sổ RPG, icon và hình minh hoạ pixel vẽ bằng code, linh vật Curio |
| **Ngày / Đêm** | Sổ tay pixel dưới trời xanh ↔ bầu trời sao lo-fi, tự theo hệ điều hành |
| **Song ngữ** | Tiếng Việt chính (`/`), tiếng Anh tuỳ bài (`/en/`) |
| **Tìm kiếm** | Pagefind, tìm được cả khi gõ không dấu (⌘K / Ctrl+K / `/`) |
| **Ảnh chia sẻ** | Ảnh OG 1200×630 kiểu pixel cho từng bài (Satori + sharp) |
| **Khác** | RSS (VI/EN), sitemap, JSON-LD, KaTeX, code tô màu theo theme, 404 "Lạc vào hố đen" |

## Chạy trên máy

Cần Node ≥ 22.23.4 và pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:4321/curioverse/ (bài nháp cũng hiện)
pnpm build        # build + chỉ mục tìm kiếm → dist/
pnpm preview      # xem bản build
pnpm check        # kiểm tra kiểu + frontmatter
pnpm check:links  # tìm link nội bộ hỏng (sau khi build)
pnpm new story "Tiêu đề"   # tạo bài mới (story | work | note | now, thêm --en cho tiếng Anh)
```

## Deploy

Mỗi lần push lên `main`, GitHub Actions (`.github/workflows/deploy.yml`) sẽ kiểm tra, build, dò link hỏng rồi deploy lên **GitHub Pages**.

1. Vào **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Địa chỉ mặc định: `https://quochuyy.github.io/curioverse/`.

> Muốn deploy ở nơi khác (Cloudflare Pages / Vercel): build command `pnpm build`, output `dist`, đặt `SITE_URL` và `BASE_PATH=/`.

**Tên miền riêng:** vào *Settings → Secrets and variables → Actions → Variables*, thêm `SITE_URL=https://ten-mien-cua-ban` và `BASE_PATH=/`, rồi cấu hình domain trong *Settings → Pages*. (Hoặc sửa 2 dòng đầu `astro.config.mjs`.)

## Cấu trúc

```
src/
├─ content/            ← nội dung (Markdown/MDX, journey.yaml)
├─ content.config.ts   ← schema frontmatter
├─ site.config.ts      ← tên, mô tả, mạng xã hội (có TODO cần điền)
├─ i18n/               ← chuỗi giao diện vi/en, đường dẫn, định dạng ngày
├─ lib/                ← xử lý nội dung, đồ thị, chòm sao, pixel art (icon, linh vật), ảnh OG, RSS
├─ components/         ← Header, Footer, thẻ bài, Bản đồ sao, MDX components…
├─ views/              ← phần thân các trang (dùng chung cho VI và EN)
├─ pages/              ← route (VI ở gốc, EN trong en/)
└─ styles/             ← design tokens, khung pixel, kiểu chữ bài viết
plugins/               ← rehype plugin thêm base path cho link trong Markdown
scripts/               ← new.mjs (tạo bài), check-links.mjs (dò link hỏng)
docs/                  ← ý tưởng + hướng dẫn viết
```

## Công nghệ

[Astro 7](https://astro.build) · MDX · TypeScript · CSS thuần (design tokens) · d3-force · Pagefind · Satori + sharp · KaTeX · Shiki · Fontsource (Handjet, M PLUS Rounded 1c, VT323, JetBrains Mono).

Font trong `src/assets/og-fonts/` dùng giấy phép SIL Open Font License 1.1.
