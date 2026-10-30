"use client";

import { useRef } from "react";
import { SITE } from "@/lib/site";

type Props = {
  src: string;
  srcSet?: string;
  alt?: string;
  className?: string;          // class cho <img> ảnh chính
  wrapperClassName?: string;   // class cho div bọc ngoài
  onClick?: () => void;
  watermarkSrc?: string;       // mặc định SITE.watermark (lib/site.ts)
  watermarkSize?: number;      // px, mặc định 40
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
  opacity?: number;            // 0 -> 1, mặc định 0.55
  /** "lazy" (mặc định): chỉ tải khi sắp cuộn tới. Ảnh chính đầu trang nên dùng "eager". */
  loading?: "lazy" | "eager";
  sizes?: string;
};

const posClass: Record<NonNullable<Props["position"]>, string> = {
  "bottom-right": "bottom-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "top-right": "top-2 right-2",
  "top-left": "top-2 left-2",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

/**
 * Ảnh có logo watermark ở góc + chặn các thao tác tải ảnh cơ bản
 * (kéo thả, chuột phải "Lưu ảnh", long-press trên mobile).
 * Lưu ý: đây chỉ là rào cản kỹ thuật cơ bản (deterrent), không thể
 * chặn tuyệt đối người dùng cố tình chụp màn hình / dùng devtools.
 */
export default function WatermarkImage({
  src,
  srcSet,
  alt = "",
  className = "",
  wrapperClassName = "",
  onClick,
  // Ảnh watermark lấy từ SITE.watermark (lib/site.ts). Để trống = không đóng watermark.
  watermarkSrc = SITE.watermark,
  watermarkSize = 40,
  position = "bottom-right",
  opacity = 0.55,
  loading = "lazy",
  sizes,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const block = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={wrapRef}
      className={`relative select-none ${wrapperClassName}`}
      onContextMenu={block}
      onDragStart={block}
    >
      {/* ẢNH GỐC - pointer-events-none để mọi thao tác chuột/chạm
          (kể cả long-press "Lưu hình ảnh" trên mobile) rơi xuống
          lớp overlay bên dưới thay vì trúng thẳng thẻ <img> */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        onContextMenu={block}
        onDragStart={block}
        className={`pointer-events-none select-none ${className}`}
      />

      {/* LỚP OVERLAY TRONG SUỐT - nhận toàn bộ click/chạm/chuột phải
          thay cho ảnh, tự forward click ra ngoài nếu cần (vd. chọn thumbnail) */}
      <div
        className="absolute inset-0"
        onClick={onClick}
        onContextMenu={block}
        onDragStart={block}
      />

      {/* LOGO WATERMARK - giữ nguyên tỉ lệ gốc, không bóp méo */}
      {watermarkSrc ? <img
        src={watermarkSrc}
        alt=""
        loading="lazy"
        draggable={false}
        aria-hidden
        className={`absolute pointer-events-none select-none drop-shadow-md ${posClass[position]}`}
        style={{ width: watermarkSize, height: "auto", opacity }}
      /> : null}
    </div>
  );
}