// lib/site.ts
export const SITE_URL =
  (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const abs = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// =====================================================================
//  THÔNG TIN CÔNG TY – sửa 1 chỗ, áp dụng toàn website (header, footer,
//  trang liên hệ, nút gọi/Zalo, dữ liệu SEO gửi Google…)
//
//  ⚠️ Các dòng có ghi "ĐIỀN" là thông tin tạm, cần thay bằng thông tin thật
//     trước khi đưa website lên mạng.
// =====================================================================
export const SITE = {
  /** Tên ngắn dùng trong tiêu đề trang: "Sản phẩm | HÒA THÀNH" */
  name: "HÒA THÀNH",
  /** Tên hiển thị trên logo, footer */
  brand: "Hòa Thành",
  /** 2 chữ trong ô logo vuông (khi chưa có logo ảnh) */
  monogram: "HT",
  legalName: "Công ty TNHH XNK máy móc thiết bị Hòa Thành",
  tagline: "Máy móc thiết bị nhập khẩu cho nhà xưởng và doanh nghiệp sản xuất.",

  phone: "0900000000", // ĐIỀN: số hotline viết liền, dùng cho nút gọi
  phoneDisplay: "0900 000 000", // ĐIỀN: số hotline hiển thị
  email: "lienhe@hoathanh.vn", // ĐIỀN

  address: "[ĐIỀN địa chỉ công ty]",
  /** Dùng cho dữ liệu doanh nghiệp gửi Google (LocalBusiness) */
  addressParts: {
    street: "[ĐIỀN số nhà, đường]",
    locality: "[ĐIỀN quận/huyện]",
    region: "[ĐIỀN tỉnh/thành phố]",
  },
  /** Toạ độ bản đồ (lấy trên Google Maps). Để null nếu chưa có. */
  geo: null as null | { lat: number; lng: number },
  /** Link nhúng Google Maps (Chia sẻ → Nhúng bản đồ → copy phần src). Để "" nếu chưa có. */
  mapEmbedUrl: "",
  openingHours: { days: "Thứ 2 – Thứ 7", open: "08:00", close: "17:00" },

  taxCode: "[ĐIỀN MST]",
  taxCodeIssuedAt: "[ĐIỀN ngày cấp]",
  foundingDate: "", // ĐIỀN dạng 2015-01-31, để "" nếu không muốn công bố

  zaloUrl: "https://zalo.me/0900000000", // ĐIỀN
  // Mạng xã hội: để "" thì nút đó tự ẩn
  facebookUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",

  /** Logo ảnh trong /public (để "" thì dùng ô chữ monogram + tên) */
  logo: "/images/logo-hoathanh.png",
  /** Ảnh watermark đóng lên ảnh sản phẩm (để "" thì không đóng watermark) */
  watermark: "/images/logo-wm.png",
} as const;

/** Danh sách mạng xã hội đã điền (bỏ link trống) */
export const SOCIAL_LINKS = [
  { key: "fb", label: "Facebook", href: SITE.facebookUrl },
  { key: "ytb", label: "YouTube", href: SITE.youtubeUrl },
  { key: "tt", label: "TikTok", href: SITE.tiktokUrl },
  { key: "zalo", label: "Zalo", href: SITE.zaloUrl },
].filter((s) => s.href);
