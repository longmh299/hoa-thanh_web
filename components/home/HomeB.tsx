// components/home/HomeB.tsx — giao diện trang chủ B "bán hàng sôi động".
// Chỉ nhận dữ liệu qua props (app/page.tsx lo phần truy vấn), nên dễ thay đổi bố cục.
import Link from "next/link";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import { cld } from "@/lib/cloudinary";
import { SITE } from "@/lib/site";

export type HomeCategory = { id: number; name: string; slug: string };

export type HomeCategoryBlock = HomeCategory & {
  banner: string | null;
  metaDescription: string | null;
  products: ProductCardData[];
};

export type HomePost = {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  excerpt: string | null;
  createdAt: Date | string;
  category: { name: string } | null;
};

export type HomeBProps = {
  sidebarCategories: HomeCategory[];
  bestSellers: ProductCardData[];
  categoryBlocks: HomeCategoryBlock[];
  posts: HomePost[];
};

const BADGES = [
  { t: "Hàng chính hãng", d: "Nhập khẩu trực tiếp, đủ CO – CQ", icon: "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zm-1.2 13.5-3.3-3.3 1.4-1.4 1.9 1.9 4.5-4.5 1.4 1.4-5.9 5.9z" },
  { t: "Giao hàng toàn quốc", d: "Lắp đặt, chạy thử tận nơi", icon: "M3 6h11v9H3zM14 9h4l3 3v3h-7zM7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { t: "Bảo hành tận nơi", d: "Linh kiện thay thế sẵn kho", icon: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z" },
  { t: "Báo giá trong ngày", d: "Tư vấn miễn phí, đúng nhu cầu", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4V6h-2v7.4l4.6 2.8 1-1.7-3.6-2.1z" },
];

function niceName(name: string) {
  const clean = name.replace(/\s+,/g, ",").replace(/\s+/g, " ").trim();
  if (clean !== clean.toLocaleUpperCase("vi")) return clean;
  const lower = clean.toLocaleLowerCase("vi");
  return lower.charAt(0).toLocaleUpperCase("vi") + lower.slice(1);
}

function SectionHead({ title, href, more = "Xem tất cả" }: { title: string; href?: string; more?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="section-title">{title}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-[14px] font-semibold text-[var(--color-primary)] hover:underline">
          {more} ›
        </Link>
      )}
    </div>
  );
}

export default function HomeB({ sidebarCategories, bestSellers, categoryBlocks, posts }: HomeBProps) {
  const hero = bestSellers.find((p) => p.coverImage) || bestSellers[0];
  const month = new Date().getMonth() + 1;

  return (
    <main className="bg-[var(--color-bg)] pb-4 text-[var(--color-ink)]">
      <h1 className="sr-only">
        {SITE.legalName} – máy móc thiết bị nhập khẩu chính hãng
      </h1>

      {/* ===== HERO: danh mục + banner chính + 2 banner phụ ===== */}
      <section className="mx-auto max-w-[1320px] px-4 pt-4 md:px-8 md:pt-5">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
          {/* Danh mục (desktop) */}
          <nav aria-label="Danh mục sản phẩm" className="panel hidden overflow-hidden lg:block">
            <ul className="py-1.5">
              {sidebarCategories.slice(0, 10).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/${c.slug}`}
                    className="flex items-center justify-between gap-2 px-4 py-[9px] text-[14px] text-[var(--color-ink)] transition hover:bg-[var(--color-blue-soft)] hover:text-[var(--color-primary)]"
                  >
                    <span className="line-clamp-1">{niceName(c.name)}</span>
                    <span aria-hidden className="text-[#8A94A8]">›</span>
                  </Link>
                </li>
              ))}
              {sidebarCategories.length === 0 && (
                <li className="px-4 py-3 text-[13.5px] leading-relaxed text-[var(--color-muted)]">
                  Chưa có danh mục. Thêm danh mục trong trang quản trị để hiện ở đây.
                </li>
              )}
              <li>
                <Link href="/san-pham" className="block px-4 py-[9px] text-[14px] font-semibold text-[var(--color-primary)]">
                  Xem tất cả danh mục ›
                </Link>
              </li>
            </ul>
          </nav>

          {/* Banner chính */}
          <div className="relative flex min-h-[260px] overflow-hidden rounded-[14px] bg-[var(--color-navy)] text-white md:min-h-[380px]">
            {/* Mảng xiên sáng hơn phía sau máy + vạch cam mảnh */}
            <div aria-hidden className="absolute inset-y-0 right-0 w-[52%] bg-[#1A68D3] [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]" />
                        <div aria-hidden className="absolute bottom-0 left-0 h-[4px] w-full bg-[var(--color-promo)]" />

            <div className="relative z-10 flex max-w-[60%] flex-col justify-center gap-4 p-6 md:max-w-[58%] md:p-10">
              <span className="w-fit rounded-[6px] bg-[var(--color-promo)] px-2.5 py-1 font-display text-[12px] font-extrabold uppercase tracking-[0.08em] text-white">
                Ưu đãi tháng {month}
              </span>
              <h2 className="font-display text-[clamp(22px,2.4vw,34px)] font-extrabold leading-[1.18] tracking-[-0.03em] [text-wrap:balance]">
                Máy móc nhập khẩu chính hãng – giá tốt tại kho
              </h2>
              <p className="hidden text-[15px] leading-relaxed text-[#E1EAF8] sm:block">
                Đầy đủ chứng từ CO, CQ. Giao hàng, lắp đặt và bảo hành tận nơi trên toàn quốc.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <Link
                  href="/san-pham"
                  className="inline-flex min-h-[46px] items-center rounded-[10px] bg-[var(--color-promo)] px-6 font-display text-[15px] font-bold text-white transition hover:bg-[var(--color-promo-dark)]"
                >
                  Xem sản phẩm
                </Link>
                <Link
                  href="/lien-he"
                  className="hidden min-h-[46px] items-center rounded-[10px] border-[1.5px] border-[rgba(255,255,255,0.45)] px-6 font-display text-[15px] font-bold text-white transition hover:bg-[rgba(255,255,255,0.1)] sm:inline-flex"
                >
                  Nhận báo giá
                </Link>
              </div>
            </div>

            {!hero?.coverImage && (
              <div aria-hidden className="absolute bottom-0 right-0 top-0 flex w-[44%] items-center justify-center [container-type:size]">
                <span className="absolute left-1/2 top-1/2 h-[min(86cqw,80cqh)] w-[min(86cqw,80cqh)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                <img src={SITE.logo || "/images/logo.png"} alt="" className="relative max-w-[min(56cqw,52cqh)] object-contain" />
              </div>
            )}

            {hero?.coverImage && (
              <Link
                href={`/san-pham/${hero.slug}`}
                aria-label={hero.name}
                className="group absolute bottom-0 right-0 top-0 flex w-[44%] items-center justify-center [container-type:size]"
              >
                <span className="absolute left-1/2 top-1/2 h-[min(86cqw,80cqh)] w-[min(86cqw,80cqh)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" aria-hidden />
                <img
                  src={cld(hero.coverImage, 700, 700, "fit")}
                  alt={hero.name}
                  className="relative max-h-[min(58cqw,54cqh)] max-w-[min(58cqw,54cqh)] object-contain mix-blend-multiply transition duration-500 group-hover:scale-[1.04]"
                />
              </Link>
            )}
          </div>

          {/* 2 banner phụ */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <Link
              href="/lien-he"
              className="group relative flex min-h-[130px] flex-col justify-between gap-2 overflow-hidden rounded-[14px] bg-[var(--color-promo-soft)] p-4 md:p-5"
            >
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-promo)]">Báo giá nhanh</span>
              <span className="font-display text-[16px] font-extrabold leading-snug tracking-[-0.02em] text-[var(--color-navy)] md:text-[20px]">
                Gửi yêu cầu, <br className="hidden lg:block" />
                nhận báo giá trong ngày
              </span>
              <span className="text-[13.5px] font-semibold text-[var(--color-primary)] group-hover:underline">Gửi ngay ›</span>
            </Link>
            <Link
              href="/chinh-sach-bao-hanh-giao-hang"
              className="group relative flex min-h-[130px] flex-col justify-between gap-2 overflow-hidden rounded-[14px] bg-[var(--color-blue-soft)] p-4 md:p-5"
            >
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-primary)]">Dịch vụ</span>
              <span className="font-display text-[16px] font-extrabold leading-snug tracking-[-0.02em] text-[var(--color-navy)] md:text-[20px]">
                Lắp đặt & bảo hành <br className="hidden lg:block" />
                tận nơi toàn quốc
              </span>
              <span className="text-[13.5px] font-semibold text-[var(--color-primary)] group-hover:underline">Xem chính sách ›</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CAM KẾT ===== */}
      <section className="mx-auto max-w-[1320px] px-4 pt-4 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {BADGES.map((b) => (
            <div key={b.t} className="panel flex items-center gap-2.5 p-3 md:gap-3 md:p-4">
              <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--color-promo-soft)] text-[var(--color-promo)] md:h-11 md:w-11">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d={b.icon} /></svg>
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[13.5px] font-bold md:text-[15px]">{b.t}</span>
                <span className="mt-0.5 hidden text-[12.5px] text-[var(--color-muted)] md:block">{b.d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MÁY BÁN CHẠY ===== */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-4 pt-8 md:px-8 md:pt-10">
          <div className="panel p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <h2 className="section-title">Máy bán chạy</h2>
              <div className="order-last -mx-1 flex w-full gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] md:order-none md:w-auto md:flex-1">
                {sidebarCategories.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    href={`/${c.slug}`}
                    className="shrink-0 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-[13.5px] font-medium text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    {niceName(c.name)}
                  </Link>
                ))}
              </div>
              <Link href="/san-pham" className="ml-auto text-[14px] font-semibold text-[var(--color-primary)] hover:underline">
                Xem tất cả ›
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
              {bestSellers.slice(0, 10).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== DẢI KÊU GỌI ===== */}
      <section className="mx-auto max-w-[1320px] px-4 pt-8 md:px-8 md:pt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-[14px] bg-[var(--color-promo)] px-5 py-6 text-white md:flex-row md:items-center md:px-8">
          <div>
            <div className="font-display text-[19px] font-extrabold tracking-[-0.02em] md:text-[24px]">Chưa biết chọn máy nào?</div>
            <div className="mt-1 text-[14.5px] text-[#FFE3D2]">
              Kỹ thuật viên tư vấn miễn phí theo sản lượng và ngân sách của bạn.
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a
              href={`tel:${SITE.phone}`}
              className="inline-flex min-h-[46px] items-center rounded-[10px] bg-[var(--color-navy)] px-5 font-display text-[15px] font-extrabold text-white transition hover:bg-[#073F8F]"
            >
              Gọi {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.zaloUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-[46px] items-center rounded-[10px] bg-white px-5 font-display text-[15px] font-bold text-[var(--color-navy)] transition hover:brightness-95"
            >
              Chat Zalo
            </a>
          </div>
        </div>
      </section>

      {/* ===== TỪNG DANH MỤC NỔI BẬT ===== */}
      {categoryBlocks
        .filter((b) => b.products.length > 0)
        .map((b) => (
          <section key={b.id} className="mx-auto max-w-[1320px] px-4 pt-8 md:px-8 md:pt-10">
            <SectionHead title={niceName(b.name)} href={`/${b.slug}`} />
            <div className="grid gap-3 md:gap-4 lg:grid-cols-[240px_1fr]">
              {/* Ô giới thiệu danh mục */}
              <Link
                href={`/${b.slug}`}
                className="group relative hidden min-h-[320px] flex-col justify-end overflow-hidden rounded-[12px] bg-[var(--color-navy)] p-5 text-white lg:flex"
              >
                {b.banner && (
                  <img
                    src={cld(b.banner, 480, 720, "fill")}
                    alt={b.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.04]"
                  />
                )}
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,63,143,0)_30%,rgba(8,63,143,0.92)_100%)]" />
                <span className="relative text-[20px] font-extrabold leading-tight">{niceName(b.name)}</span>
                {b.metaDescription && (
                  <span className="relative mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#E1EAF8]">{b.metaDescription}</span>
                )}
                <span className="relative mt-4 w-fit rounded-[8px] bg-[var(--color-promo)] px-3.5 py-2 font-display text-[13.5px] font-bold text-white">
                  Xem dòng máy ›
                </span>
              </Link>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {b.products.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* ===== TIN TỨC ===== */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-4 pt-8 md:px-8 md:pt-10">
          <div className="panel p-4 md:p-6">
            <SectionHead title="Tin tức & hướng dẫn" href="/tin-tuc" />
            <div className="grid gap-4 md:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/tin-tuc/${post.slug}`} className="group flex gap-3.5 md:flex-col md:gap-3">
                  <div className="w-[120px] shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-sand)] [aspect-ratio:4/3] md:w-full md:[aspect-ratio:16/10]">
                    <img
                      src={cld(post.coverImage, 640, 400, "fill") || "/images/no-image.jpg"}
                      loading="lazy"
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-[var(--color-muted)]">
                      {post.category?.name || "Tin tức"} · {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[15.5px] font-bold leading-snug group-hover:text-[var(--color-primary)] md:text-[17px]">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1 hidden text-[14px] leading-relaxed text-[var(--color-muted)] md:block">
                        <span className="line-clamp-2">{post.excerpt}</span>
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
