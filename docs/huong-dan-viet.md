# Hướng dẫn viết cho Curioverse

Mọi nội dung nằm trong `src/content/`. Bạn chỉ cần viết Markdown/MDX; giao diện, bản đồ sao, ảnh chia sẻ, RSS, tìm kiếm đều tự sinh.

```
src/content/
├─ stories/{vi,en}/*.mdx   Câu chuyện
├─ work/{vi,en}/*.mdx      Công việc
├─ notes/{vi,en}/*.mdx     Ghi chép
├─ now/{vi,en}/*.md        Bây giờ (mỗi tháng một file)
├─ pages/{vi,en}/about.mdx Giới thiệu
└─ journey.yaml            Cột mốc hành trình
```

## Tạo bài mới nhanh

```bash
pnpm new story "Tiêu đề câu chuyện"     # → src/content/stories/vi/tieu-de-cau-chuyen.mdx
pnpm new work  "Tên dự án"
pnpm new note  "Tên ghi chép"
pnpm new now                             # → src/content/now/vi/2026-12.md
pnpm new story "English title" --en      # bản tiếng Anh
```

Script tự bỏ dấu để tạo tên file (`Thị giác máy tính` → `thi-giac-may-tinh`), điền sẵn frontmatter và ngày hôm nay. Bài mới mặc định là `draft: true`.

## Vòng đời một bài

1. `pnpm dev` → mở `http://localhost:4321/curioverse/`. Bài nháp hiện kèm nhãn **NHÁP**.
2. Viết. Dùng `<Prompt>` để nhắc mình viết gì ở đoạn nào (chỉ hiện khi dev).
3. Xong thì đổi `draft: false`, commit, push. GitHub Actions sẽ build và deploy.

Muốn xem bản build thật *có cả nháp*: `PUBLIC_SHOW_DRAFTS=true pnpm build && pnpm preview`.

## Frontmatter

### Chung cho mọi bài

```yaml
title: 'Tiêu đề'                  # nên để trong ngoặc nếu có dấu ':'
description: Một câu tóm tắt.      # hiện trên thẻ bài, kết quả tìm kiếm, ảnh chia sẻ
tags: [thị giác máy tính, YOLO]   # chủ đề, cũng là "chòm sao" trên bản đồ sao
related: [work/aeroeyes, notes/vat-the-nho]  # nối cạnh đậm trên bản đồ sao
translationKey: ten-chung         # (tuỳ chọn) ghép bản dịch nếu tên file khác nhau
draft: false
```

### Câu chuyện

```yaml
date: 2026-11-05
updated: 2026-12-01   # tuỳ chọn
series: Một năm học ML # tuỳ chọn
featured: true        # tuỳ chọn
```

### Công việc

```yaml
role: Xây dựng pipeline dữ liệu và huấn luyện
period:
  start: '2025-09'    # "2025" | "2025-09" | 2025-09-14
  end: '2025-12'      # bỏ trống nếu đang làm
periodPrecision: month # year | month | day — cách hiển thị thời gian
status: hoan-thanh     # dang-lam | hoan-thanh | luu-tru
category: cuoc-thi     # nghien-cuu | cuoc-thi | du-an | hoc-tap
stack: [Python, PyTorch]
links:
  repo: https://github.com/...
  demo: https://...
  paper: https://...
highlights:
  - Điểm chính 1
  - Điểm chính 2
featured: true         # hiện ở mục Nổi bật
order: 1               # nhỏ hơn xếp trước
```

Khung gợi ý cho case study: **Bối cảnh → Bài toán → Cách tiếp cận → Kết quả → Điều mình học được → Nếu làm lại.**

### Ghi chép

```yaml
stage: nebula     # nebula (Tinh vân) → protostar (Tiền sao) → star (Ngôi sao)
planted: 2026-11-05
tended: 2026-12-10  # lần chỉnh sửa gần nhất
```

| Độ chín | Khi nào dùng |
| --- | --- |
| `nebula` · Tinh vân | Ý tưởng thô, gạch đầu dòng, câu hỏi. Được phép sai. |
| `protostar` ✧ Tiền sao | Đã có cấu trúc, lập luận, nhưng còn chỉnh. |
| `star` ✦ Ngôi sao | Đã kiểm chứng, có thể trích dẫn. |

Khi nâng độ chín, nhớ cập nhật `tended`.

### Bây giờ

Mỗi tháng tạo một file `src/content/now/vi/YYYY-MM.md` với `date:`. File mới nhất hiện ở trang Now và dải "Bây giờ" trên trang chủ, các file cũ tự vào mục lưu trữ.

### Hành trình (`journey.yaml`)

```yaml
- id: ten-moc-khong-dau
  date: '2025-09'          # nhớ để trong ngoặc kép
  kind: cuoc-thi           # hoc-tap | cong-viec | cuoc-thi | chung-chi | du-an | cot-moc
  title:
    vi: Tiêu đề tiếng Việt
    en: English title      # tuỳ chọn
  description:
    vi: Mô tả ngắn         # tuỳ chọn
  link: /cong-viec/aeroeyes # link nội bộ (không cần /curioverse) hoặc URL ngoài
  draft: false
```

Dự án trong `work/` **tự động** xuất hiện trên dòng thời gian. Chỉ khai báo thêm ở đây nếu muốn mô tả khác.

## Liên kết & hình ảnh

- Link nội bộ viết **không cần** `/curioverse`: `[AeroEyes](/cong-viec/aeroeyes)`. Plugin tự thêm base path khi build.
- Link giữa các bài sẽ thành cạnh đậm trên bản đồ sao và hiện trong mục "Được nhắc đến trong" của bài được nhắc. Đừng link từ bài đã đăng sang bài còn nháp, vì `pnpm check:links` sẽ báo link hỏng.
- Ảnh: đặt trong `public/images/...` rồi viết `![mô tả](/images/ten-anh.png)`, hoặc dùng `<Figure>`.

## Component dùng trong MDX (không cần import)

```mdx
<Callout type="tip" title="Mẹo">Nội dung…</Callout>        {/* type: note | tip | warn | insight */}

<Figure src="/images/drone.png" alt="Khung hình drone" caption="Vật thể chỉ vài chục điểm ảnh" />

<Sidenote>Ghi chú bên lề, nằm ở lề phải trên màn hình rộng.</Sidenote>

<Prompt>Gợi ý viết, chỉ hiện khi đang soạn.</Prompt>
```

Công thức toán dùng KaTeX: `$x^2$` trong dòng, `$$ ... $$` cho một khối riêng.

Code có tô màu theo theme Ngày/Đêm: dùng ```` ```python ```` như bình thường.

## Song ngữ

- Bản tiếng Việt ở `vi/`, bản tiếng Anh ở `en/`, **cùng tên file** là tự ghép cặp. Nút VI/EN sẽ nhảy đúng sang bản dịch.
- Không bắt buộc dịch mọi bài. Bài chỉ có tiếng Việt vẫn hiện ở trang tiếng Anh, kèm nhãn "VI".
- Chuỗi giao diện nằm ở `src/i18n/ui.ts`.

## Lệnh hay dùng

| Lệnh | Việc |
| --- | --- |
| `pnpm dev` | Chạy site để viết (có nháp) |
| `pnpm build` | Build thật + tạo chỉ mục tìm kiếm |
| `pnpm preview` | Xem bản build |
| `pnpm check` | Kiểm tra kiểu và frontmatter |
| `pnpm check:links` | Tìm link nội bộ hỏng (sau khi build) |
