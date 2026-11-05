/**
 * Cấu hình chung của Curioverse — một nguồn duy nhất cho tên, mô tả, liên kết.
 * Chỗ nào có `TODO` là chỗ Huy nên tự điền/kiểm tra lại.
 */
export const SITE = {
  name: 'Curioverse',
  author: 'Huy',
  /** Tên đầy đủ dùng trong JSON-LD / meta. TODO: điền họ tên đầy đủ nếu muốn. */
  fullName: 'Quốc Huy',
  tagline: {
    vi: 'Vũ trụ tò mò của Huy',
    en: "Huy's universe of curiosity",
  },
  description: {
    vi: 'Curioverse — nơi Huy kể chuyện, chia sẻ công việc và ghi lại hành trình lớn lên cùng AI. Mỗi bài viết là một ngôi sao.',
    en: 'Curioverse — where Huy shares stories, work and a journey of growing up with AI. Every post is a star.',
  },
  role: {
    vi: 'Kỹ sư AI',
    en: 'AI Engineer',
  },
  location: {
    vi: 'TP. Hồ Chí Minh',
    en: 'Ho Chi Minh City',
  },
  /** Ảnh đại diện. TODO: thay bằng ảnh của bạn trong /public nếu muốn. */
  avatar: 'https://avatars.githubusercontent.com/u/50985467?v=4',
  /** Repo chứa mã nguồn website — dùng cho nút "Sửa bài này". */
  repo: 'https://github.com/QuocHuyy/curioverse',
  repoBranch: 'main',
  /** Năm bắt đầu — dùng cho dòng bản quyền và thống kê. */
  since: 2019,
  socials: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/QuocHuyy' },
    // TODO: bỏ comment và điền link thật
    // { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/...' },
    // { id: 'mail', label: 'Email', href: 'mailto:...' },
  ] as { id: 'github' | 'linkedin' | 'mail' | 'globe'; label: string; href: string }[],
} as const;

export type SiteConfig = typeof SITE;
