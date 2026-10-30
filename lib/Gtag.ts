// lib/gtag.ts
// Helper cho Google Analytics 4 (gtag.js).
// ID được lấy từ biến môi trường NEXT_PUBLIC_GA_ID (bắt buộc prefix
// NEXT_PUBLIC_ vì cần đọc được ở phía client).

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/** Bắn 1 lượt xem trang (gọi khi chuyển route trong App Router). */
export function gaPageview(url: string): void {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: url,
  });
}

/** Bắn 1 sự kiện tuỳ ý, ví dụ: submit form liên hệ, bấm gọi điện... */
export function gaEvent(
  action: string,
  params?: Record<string, unknown>
): void {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", action, params || {});
}