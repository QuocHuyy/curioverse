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

## 6. Ngôn ngữ thiết kế

**Hai chế độ, một bản sắc:**

| | Ngày: Sổ tay | Đêm: Bầu trời |
| --- | --- | --- |
| Nền | Giấy ngà `#F6F1E7`, vân giấy rất nhẹ | Xanh đêm `#0B0F1E`, quầng tinh vân |
| Chữ | Mực `#1D1B26` | Ánh sao `#E9E6F2` |
| Liên kết | Chàm `#2F3A8F` | Xanh nhạt `#9DB2FF` |
| Điểm nhấn | Hổ phách `#9A5B00` / `#E39B2D` | Hổ phách sáng `#F5C26B` |
| Chòm sao | Nét đứt như in trên bản đồ thiên văn | Sao phát sáng, lấp lánh nhẹ |

**Màu theo loại:** câu chuyện là hổ phách, công việc là chàm, ghi chép là xanh ngọc.

**Chữ** (đều có đủ dấu tiếng Việt):
- *Fraunces* cho tiêu đề: serif ấm, có cá tính, hợp chất "sổ tay".
- *Be Vietnam Pro* cho thân bài và giao diện: thiết kế riêng cho tiếng Việt nên dấu không bị dính.
- *JetBrains Mono* cho code.
- Thân bài 17–18px, line-height 1.75 (dấu chồng cần khoảng thở), độ rộng dòng khoảng 68 ký tự.

**Họa tiết:** ký hiệu ✦ ✧ ·, đường phân cách hình chòm sao, quỹ đạo nét đứt, logo là ngôi sao bốn cánh có quỹ đạo và một vệ tinh nhỏ.

**Nguyên tắc:** nội dung trước, trang trí sau. Hiệu ứng chuyển động đều tắt khi người đọc bật "giảm chuyển động". Tương phản màu đạt WCAG AA ở cả hai chế độ.

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
