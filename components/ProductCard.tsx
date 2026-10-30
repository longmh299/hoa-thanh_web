// components/ProductCard.tsx — thẻ sản phẩm giao diện B (kiểu sàn bán hàng)
import Link from "next/link";
import WatermarkImage from "./WatermarkImage";
import { formatPrice, hasPrice } from "@/lib/price";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  price: number | null;
  coverImage: string | null;
  short: string | null;
  isFeatured?: boolean;
  category?: { id: number; name: string } | null;
};

function cldThumb(url: string | null, w = 600, h = 600) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("res.cloudinary.com") && u.pathname.includes("/upload/")) {
      return url.replace("/upload/", `/upload/c_fit,f_auto,q_auto,dpr_auto,w_${w},h_${h}/`);
    }
  } catch {}
  return url;
}

export default function ProductCard({
  p,
  as: Heading = "h3",
}: {
  p: ProductCardData;
  /** thẻ tiêu đề: h2 ở trang danh sách, h3 trong các khối trang chủ */
  as?: "h2" | "h3";
}) {
  const imgUrl = cldThumb(p.coverImage, 600, 600);
  const priced = hasPrice(p.price);

  // Dòng mô tả ngắn đầu tiên (VD: "Năng suất 200–800 kg/h")
  const firstLine = p.short
    ? p.short
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)[0]
    : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[12px] border border-[var(--color-line)] bg-white transition hover:-translate-y-0.5 hover:border-[var(--color-navy)] hover:shadow-[0_12px_28px_-14px_rgba(11,31,63,0.35)]">
      {/* ẢNH */}
      <Link
        href={`/san-pham/${p.slug}`}
        className="relative block [aspect-ratio:1/1] overflow-hidden bg-[var(--color-sand)]"
        aria-label={p.name}
      >
        {imgUrl ? (
          <WatermarkImage
            src={imgUrl}
            alt={p.name}
            wrapperClassName="flex h-full w-full items-center justify-center p-4"
            className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-[1.05]"
            watermarkSize={26}
            position="bottom-right"
            opacity={0.5}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
            Chưa có ảnh
          </div>
        )}

        {p.isFeatured && (
          <span className="absolute left-2.5 top-2.5 rounded-[6px] bg-[var(--color-promo)] px-2 py-1 font-display text-[11px] font-bold uppercase leading-none text-white">
            Bán chạy
          </span>
        )}
      </Link>

      {/* NỘI DUNG */}
      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        {p.category && (
          <div className="mb-1 line-clamp-1 text-[12px] font-medium text-[var(--color-muted)]">
            {p.category.name}
          </div>
        )}

        <Heading className="font-display text-[14.5px] font-bold leading-[1.35] tracking-[-0.01em] text-[var(--color-ink)] md:text-[15.5px]">
          <Link
            href={`/san-pham/${p.slug}`}
            className="line-clamp-2 min-h-[2.7em] hover:text-[var(--color-primary)]"
          >
            {p.name}
          </Link>
        </Heading>

        {firstLine && (
          <p className="mt-1 line-clamp-1 text-[13px] text-[var(--color-muted)]">{firstLine}</p>
        )}

        <div className="min-h-3 flex-1" />

        <div
          className={`mt-2 font-display text-[17px] font-extrabold leading-none tracking-[-0.01em] md:text-[19px] ${
            priced ? "text-[var(--color-price)]" : "text-[var(--color-navy)]"
          }`}
        >
          {priced ? formatPrice(p.price) : "Liên hệ"}
        </div>

        <Link
          href={`/lien-he?sp=${encodeURIComponent(p.name)}`}
          className="mt-3 inline-flex min-h-[38px] items-center justify-center rounded-[8px] border-[1.5px] border-[var(--color-navy)] font-display text-[13.5px] font-bold text-[var(--color-navy)] transition hover:bg-[var(--color-navy)] hover:text-white"
        >
          Nhận báo giá
        </Link>
      </div>
    </article>
  );
}
