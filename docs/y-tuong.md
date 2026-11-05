# Curioverse: tài liệu ý tưởng

> **Curioverse là vũ trụ tò mò của Huy.** Mỗi bài viết là một ngôi sao, và vũ trụ này giãn nở dần khi Huy học thêm, làm thêm, sống thêm.

Tài liệu này ghi lại *vì sao* website được thiết kế như hiện tại, để sau này mỗi quyết định mới (thêm mục, đổi giao diện, viết loại bài mới) đều có chỗ để đối chiếu.

---

## 1. Tầm nhìn

Một website cá nhân **kể được chuyện**, chứ không chỉ liệt kê thành tích. Người đọc rời đi sẽ hiểu:

1. **Huy là ai.** Một kỹ sư AI ở TP.HCM, vừa học trường lớp vừa tự học, tò mò về nhiều thứ.
2. **Huy đã làm gì và làm tốt đến đâu.** Có bằng chứng cụ thể: dự án, mã nguồn, con số.
3. **Huy đang đi về đâu.** Hành trình phát triển hiện ra rõ ràng, kể cả những lần vấp.

**Câu định vị:** *"Nơi mình cất giữ những câu chuyện, công việc và từng bước mình lớn lên."*

## 2. Đối tượng (đã chốt: cân bằng)

| Ai | Họ cần gì | Họ vào đâu đầu tiên |
| --- | --- | --- |
| Nhà tuyển dụng, đối tác | Bằng chứng năng lực, đọc nhanh | Công việc → Giới thiệu (có bản EN) |
| Người học AI (đặc biệt người Việt) | Kiến thức dễ hiểu, kinh nghiệm thật | Ghi chép → Câu chuyện |
| Bạn bè, chính Huy sau này | Nhìn lại mình đã đi bao xa | Hành trình → Bây giờ |

Nguyên tắc: **câu chuyện là lõi, công việc là bằng chứng.** Trang chủ mở đầu bằng con người, rồi mới đến dự án.

## 3. Ẩn dụ vũ trụ và cách nó vận hành

Ẩn dụ chỉ có giá trị khi nó *làm việc*, không chỉ để trang trí:

| Ẩn dụ | Trên website | Vì sao có ích |
| --- | --- | --- |
| Ngôi sao | Mỗi bài viết | Một đơn vị nội dung rõ ràng |
| Chòm sao | Các bài cùng chủ đề hoặc liên kết với nhau | Giúp người đọc đi tiếp sang bài liên quan |
| **Bản đồ sao** | Đồ thị tương tác của toàn bộ nội dung | Cho thấy tri thức của Huy nối với nhau thế nào (cũng hợp với mảng knowledge graph Huy nghiên cứu) |
| **Vòng đời sao** | Độ chín ghi chép: Tinh vân → Tiền sao → Ngôi sao | Cho phép đăng sớm, giảm cầu toàn, thể hiện sự trưởng thành của ý tưởng |
| **Chòm sao riêng** | Hình sinh tự động theo tên bài | Bản sắc thống nhất mà không cần ảnh stock |
| Vũ trụ giãn nở | Trang Now có lưu trữ, Hành trình theo năm | Sự phát triển hiện ra theo thời gian |
| Ngày / Đêm | Trang sổ tay / bầu trời sao | Đọc bài dài dễ chịu vào ban ngày, ấn tượng vào ban đêm |

## 4. Bốn trụ nội dung

### Câu chuyện (`/cau-chuyen`)
Trải nghiệm, suy ngẫm, nhìn lại. Bài dài, viết chậm. Danh sách nhóm theo năm như nhật ký, có hỗ trợ series.
*Ví dụ:* "Zalo AI Challenge 2025: đi tìm những thứ bé xíu từ trên cao".

### Công việc (`/cong-viec`)
Mỗi dự án là một **case study** theo khung: **Bối cảnh → Bài toán → Cách tiếp cận → Kết quả → Điều mình học được → Nếu làm lại.** Metadata gồm vai trò, thời gian, trạng thái, công nghệ, liên kết và các điểm chính. Lọc được theo Nghiên cứu, Cuộc thi, Dự án, Học tập.

### Hành trình (`/hanh-trinh`)
Dòng thời gian các cột mốc: học tập, công việc, cuộc thi, chứng chỉ, dự án, đời sống. Các dự án ở mục Công việc **tự động** hiện trên dòng thời gian. Đầu trang có số liệu tổng (số dự án, câu chuyện, ghi chép, cột mốc, số năm).

### Ghi chép (`/ghi-chep`)
Khu vườn tri thức: ghi chú ngắn, có độ chín, ngày "gieo" và ngày "chăm" gần nhất, cùng **backlinks** ("Được nhắc đến trong").

**Trang phụ:** Giới thiệu (VI + EN, có phần colophon), Bây giờ (`/now`, giữ lại các bản cũ), Chủ đề (tag), Bản đồ sao, 404 "Lạc vào hố đen".

## 5. Kiến trúc thông tin

```
/                       Trang chủ: hero, Bây giờ, Câu chuyện mới, Công việc nổi bật, Hành trình, Ghi chép
├─ /cau-chuyen/         danh sách theo năm → /cau-chuyen/<slug>/
├─ /cong-viec/          nổi bật + lưới, lọc theo loại → /cong-viec/<slug>/
├─ /hanh-trinh/         dòng thời gian, lọc theo loại mốc
├─ /ghi-chep/           lọc theo độ chín → /ghi-chep/<slug>/
├─ /ban-do-sao/         đồ thị tương tác
├─ /gioi-thieu/         giới thiệu + colophon
├─ /now/                đang làm gì + lưu trữ
├─ /chu-de/             mọi chủ đề → /chu-de/<tag>/
└─ /en/…                bản tiếng Anh (stories, work, notes, journey, universe, about, now, topics)
```

**Song ngữ:** tiếng Việt là chính. Mỗi bài viết bằng một ngôn ngữ, bài quan trọng (Giới thiệu, dự án chính) có bản tiếng Anh. Bản dịch ghép cặp theo cùng tên file. Trang tiếng Anh vẫn liệt kê các bài chỉ có tiếng Việt, kèm nhãn "VI".

## 6. Ngôn ngữ thiết kế: Pixel + Anime

Vũ trụ của Curioverse được vẽ như một **game pixel kiểu anime**: mọi khung là một "cửa sổ RPG", mọi hình minh hoạ đều ghép từ từng điểm ảnh, và có một linh vật nhỏ đi cùng người đọc. Ẩn dụ vũ trụ ở mục 3 giữ nguyên, chỉ đổi "nét vẽ".

**Hai chế độ, một bản sắc:**

| | Ngày: Sổ tay pixel dưới trời xanh | Đêm: Bầu trời sao lo-fi |
| --- | --- | --- |
| Nền | Giấy kem `#FFF7EA` kẻ ô 24px, bầu trời xanh phân tầng `#7CC8FF → #BFE6FF` | Chàm tím `#100C2A`, trời phân tầng `#070519 → #24185A` |
| Chữ | Mực tím than `#231A3B` | Ánh sao `#F5F1FF` |
| Khung cửa sổ | Viền mực, bóng đổ cứng (màu theo loại bài) | Viền oải hương `#8F84EA`, bóng đổ gần đen |
| Liên kết / điểm nhấn | Hồng anh đào `#B81D5E` / `#FF5C9E` | Hồng pastel `#FF9CCD` |
| Trang trí đầu trang | Mây tích pixel trôi chậm, ánh lấp lánh "kira-kira" | Sao pixel, trăng lưỡi liềm, sao băng |
| Chân trang | Thành phố pastel | Thành phố lên đèn, cửa sổ chớp tắt |

**Màu theo loại:** câu chuyện là nắng vàng, công việc là trời xanh, ghi chép là bạc hà.

**Chữ** (đều có đủ dấu tiếng Việt, đã kiểm tra từng dấu chồng như ữ, ặ, ở):
- *Handjet* (biến thiên, điểm ảnh vuông) cho tiêu đề, menu, nút: chữ pixel mà dấu vẫn rõ.
- *M PLUS Rounded 1c* cho thân bài: chữ tròn quen thuộc trong giao diện game/anime Nhật, đọc lâu không mỏi. Chỉ tải phần Latin + tiếng Việt.
- *VT323* chỉ cho **nhãn ngắn** (tối đa ~3 từ, viết hoa): loại bài, thanh tiêu đề cửa sổ, nhãn chỉ số. Chất "màn hình HUD". Ngày tháng, vai trò, dòng meta và mọi thứ có dạng câu dùng chữ thân bài (cỡ nhỏ, đậm 500, số đều nhau) vì chữ hoa VT323 có dấu chồng rất khó đọc khi dài.
- *JetBrains Mono* cho code.
- Thân bài ~17px, line-height 1.85, cột đọc 42rem (khoảng 70 ký tự). Trang trí pixel không bao giờ chen vào giữa đoạn văn.

**Hệ khung pixel:** viền khuyết góc + bóng đổ bậc thang, dựng hoàn toàn bằng `box-shadow` (chỉnh bằng biến `--frame`, `--hard`, `--s`, `--pu`). Có **ba bậc** để trang có thứ bậc thị giác, không phải khung nào cũng "hét":

| Bậc | Lớp | Dùng cho | Hình dạng |
| --- | --- | --- | --- |
| 1 | `.px` | Cửa sổ chính: hero, bài dẫn, dự án nổi bật, khung trạng thái, tìm kiếm | Viền mực 3px, bóng bậc thang |
| 2 | `.px-soft` | Thẻ bài, thẻ dòng thời gian, Bây giờ | Viền 2px màu giấy đậm, bóng nhỏ màu theo loại, viền mực khi hover |
| 3 | `.px-flat` | Mục lục, bộ lọc, bảng phụ, hàng liên quan | Viền 2px nhạt, không bóng |

Thẻ nhấc lên khi hover và lún xuống khi bấm như nút game. Chuyển động dùng `steps()` để có cảm giác khung hình pixel. Cửa sổ RPG dùng chung thanh tiêu đề `.win-bar`, ô chòm sao dùng nền `.sky-window`.

**Bố cục khi còn ít bài:** trang chủ gộp câu chuyện và ghi chép thành một mục "Mới viết gần đây" (bài dẫn + danh sách gọn). Khi còn ít hơn hai bài phụ, cột phải là "Lối vào khác" (chủ đề, bản đồ, RSS) thay vì để trống. Mục nào không có nội dung thì không hiện, và số thứ tự mục tự đánh lại.

**Họa tiết** (đều sinh bằng code lúc build, xem `src/lib/pixel.ts`):
- Bộ icon 12×12 vẽ tay từng điểm (`src/lib/pixel-icons.ts`).
- Chòm sao riêng của mỗi bài: sao bám lưới 32×32, đường nối Bresenham chấm chấm.
- Logo: ngôi sao 4 cánh có vành quỹ đạo và vệ tinh hồng.
- **Curio**: linh vật ngôi sao mắt to (`src/lib/mascot.ts`), có các biểu cảm vui, nháy mắt, buồn ngủ, buồn. Xuất hiện ở trang chủ (kèm bong bóng thoại), chân trang, trang trống, trang Giới thiệu và trang 404.
- Mẫu giao diện anime/visual novel: hộp thoại có bảng tên ở hero, con trỏ ▶ nhấp nháy ở nút và mục lục, trích dẫn là bong bóng thoại, thanh đọc là thanh EXP chia ô, bảng chỉ số kiểu nhân vật RPG ở trang Hành trình.

**Nguyên tắc:** nội dung trước, trang trí sau. Mọi chuyển động (mây, sao, linh vật, sao băng…) tắt khi người đọc bật "giảm chuyển động". Tương phản màu chữ đạt WCAG AA ở cả hai chế độ (kể cả trên nền trời). Không mô phỏng một game cụ thể nào: mọi hình đều tự vẽ.

## 7. Tính năng đặc trưng

1. **Bản đồ sao.** Mọi bài viết thành một đồ thị. Cạnh *đậm* là liên kết trong bài hoặc trường `related`. Cạnh *nét đứt* là chủ đề chung. Chòm sao là các chủ đề phổ biến. Vị trí tính sẵn lúc build nên tải nhanh, và vẫn xem được khi tắt JavaScript. Có kéo, zoom (Ctrl/⌘ + cuộn, chụm trên điện thoại), hover để làm sáng sao lân cận, lọc theo loại, tìm sao không cần gõ dấu, dùng được bằng bàn phím, và có chế độ xem dạng danh sách.
2. **Chòm sao riêng cho mỗi bài.** Dùng ở thẻ bài, đầu bài và ảnh chia sẻ.
3. **Độ chín ghi chép.** Hiện ở mọi nơi bài xuất hiện, kèm bộ lọc ở trang Ghi chép.
4. **Tìm kiếm toàn site.** Mở bằng ⌘K, Ctrl+K hoặc `/`. Tìm được cả khi gõ không dấu.
5. **Ảnh chia sẻ tự sinh.** Mỗi bài có ảnh 1200×630 riêng khi chia sẻ lên Facebook, LinkedIn hay Zalo.
6. **Gợi ý viết (`<Prompt>`).** Khung gợi ý chỉ hiện khi đang soạn. Lúc build, site cảnh báo nếu bài đã đăng mà còn sót gợi ý.

## 8. Chiến lược nội dung

### Giọng văn
- Xưng **"mình – bạn"**: thân thiện, thật thà, không khoe khoang.
- Cụ thể hơn chung chung: con số, đoạn code, khoảnh khắc.
- Dám kể chỗ sai. Bài học thường nằm ở đó.

### Nhịp viết gợi ý (bền vững hơn là nhiều)
| Định dạng | Tần suất | Ghi chú |
| --- | --- | --- |
| Ghi chép (tinh vân) | ~1 tuần/lần | 15 phút, ghi lại một điều vừa học |
| Câu chuyện hoặc case study | ~1 tháng/lần | Một bài viết chỉn chu |
| Cập nhật Now | Đầu mỗi tháng | Tạo file mới, file cũ tự vào lưu trữ |
| Nhìn lại năm | Cuối năm | Liên kết với Hành trình và Now của cả năm |

### Ý tưởng bài viết dành riêng cho Huy
Các bài có dấu ✔ đã có bản nháp sẵn trong repo.

**Câu chuyện**
1. ✔ *Zalo AI Challenge 2025: đi tìm những thứ bé xíu từ trên cao*
2. ✔ *Từ trang web năm 2020 đến Curioverse*: câu chuyện "trước và sau", rất hợp chủ đề phát triển
3. ✔ *Tự học và giảng đường*: hai con đường đã bù trừ cho nhau thế nào
4. ✔ *Judo dạy mình gì về việc học máy học*
5. *Một ngày làm kỹ sư AI của mình*
6. *Lần đầu mình đọc kỹ một bài báo khoa học (Rotate4D)*
7. *Những dòng code cho vui*: donut ASCII xoay, Pac-Man bằng Pygame, game Pikachu bằng C++ (repo `random-codes`)
8. *Nhìn lại 2026*: bài nhìn lại năm đầu tiên của Curioverse

**Công việc**
9. ✔ *Rotate4D*: cần làm rõ vai trò trước khi đăng
10. *RAG tiếng Việt v2*: thêm đánh giá định lượng, rerank, embedding riêng cho tiếng Việt
11. Case study cho những dự án khác bạn muốn công khai

**Ghi chép**
12. ✔ *Phép quay 4 chiều cho đồ thị tri thức*
13. ✔ *Vì sao phát hiện vật thể nhỏ lại khó?*
14. ✔ *Lấy mẫu khung hình từ video: bao nhiêu là đủ?*
15. ✔ *RAG tiếng Việt: những chỗ dễ vấp*
16. Series *"Cài lại từ con số 0"*: mỗi bài TensorTonic là một ghi chép ngắn
17. Series *"Đọc paper"*: mỗi bài báo đọc xong là một tinh vân, đọc kỹ thì nâng lên ngôi sao

## 9. Lộ trình

**Giai đoạn 1: MVP (đã xong).** Bốn trụ nội dung, song ngữ, Ngày/Đêm, Bản đồ sao, tìm kiếm, ảnh chia sẻ, RSS, sitemap, deploy tự động lên GitHub Pages, script `pnpm new`, kiểm tra link hỏng trong CI.

**Giai đoạn 2: kết nối (1–2 tháng tới)**
- Tên miền riêng (ví dụ `curioverse.dev` hay `quochuy.dev`), và chuyển trang `quochuyy.github.io` cũ về đây.
- Bình luận qua **Giscus** (GitHub Discussions). Cần repo ở chế độ public.
- Newsletter (ví dụ Buttondown) cho người không dùng RSS.
- Analytics tôn trọng riêng tư (Umami hoặc Cloudflare Web Analytics).
- Trang **Uses** (công cụ mình dùng) và **Bookshelf** (sách, khoá học, paper).
- Nút **tải CV** ở trang Giới thiệu.

**Giai đoạn 3: tương tác**
- **Demo ML ngay trong bài**: thanh trượt quay vector trong 4 chiều cho bài Rotate4D, vẽ bounding box lên khung hình drone cho AeroEyes.
- **Bản đồ sao theo thời gian**: thanh trượt năm để xem vũ trụ giãn nở từ ngôi sao đầu tiên.
- Trang series có mục lục và tiến độ đọc.
- Đồng bộ có chọn lọc các ghi chú từ Obsidian (`publish: true`).

## 10. Đo lường (nhẹ nhàng thôi)

- **Đều đặn**: số tháng liên tiếp có cập nhật Now.
- **Trưởng thành**: tỉ lệ ghi chép lên được "Ngôi sao".
- **Kết nối**: số cạnh đậm trên Bản đồ sao. Bài nào cũng nên nối với ít nhất một bài khác.
- **Tác động**: tin nhắn, email hay cơ hội đến từ website (ghi lại trong Hành trình).

## 11. Việc cần làm ngay

- [x] Chuyển repo sang public và bật GitHub Pages (Source: GitHub Actions). Site: https://quochuyy.github.io/curioverse/
- [ ] Điền email, LinkedIn trong `src/site.config.ts`.
- [ ] Đọc và sửa trang Giới thiệu (`src/content/pages/vi/about.mdx`).
- [ ] Hoàn thiện phần Kết quả của AeroEyes và RAG (khối `<Prompt>`).
- [ ] Xác nhận các mốc nháp trong `src/content/journey.yaml`.
- [ ] Chọn một câu chuyện nháp, viết xong, đổi `draft: false`. Đó là ngôi sao thứ hai.
