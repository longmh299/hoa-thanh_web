// app/san-pham/page.tsx
import { SITE } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryMegaMenu from "@/components/CategoryMegaMenu";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm – Máy móc thiết bị nhập khẩu",
  description:
    "Danh mục máy móc thiết bị nhập khẩu chính hãng từ HÒA THÀNH: giá tốt tại kho, báo giá nhanh, giao hàng và bảo hành tận nơi toàn quốc.",
  alternates: { canonical: "/san-pham" },
  openGraph: {
    title: "Sản phẩm | HÒA THÀNH",
    description:
      "Máy móc thiết bị nhập khẩu chính hãng, giao hàng toàn quốc, bảo hành tận nơi.",
    url: "/san-pham",
  },
};

export const runtime = "nodejs";
export const revalidate = 60;

const SAMPLE_PER_CATEGORY = 4;

/* ================= DATA ================= */

async function getCategoriesWithSamples() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const withProducts = await Promise.all(
    categories.map(async (cat) => {
      const items = await prisma.product.findMany({
        where: { categoryId: cat.id, published: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: SAMPLE_PER_CATEGORY,
        select: {
          id: true,
          slug: true,
          name: true,
          coverImage: true,
          price: true,
          short: true,
        },
      });

      return { ...cat, items };
    })
  );

  // chỉ giữ danh mục có ít nhất 1 sản phẩm
  return withProducts.filter((c) => c.items.length > 0);
}

/* ================= PAGE ================= */
export default async function ProductsPage() {
  const categories = await getCategoriesWithSamples();

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* ===== TIÊU ĐỀ ===== */}
      <section className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-6 px-4 pb-10 pt-14 md:px-8 md:pt-20">
        <div className="space-y-5">
          <span className="eyebrow">Sản phẩm</span>
          <h1 className="display-xl text-[clamp(28px,3.3vw,46px)]">Tất cả sản phẩm</h1>
        </div>
        <p className="max-w-[420px] text-[16px] leading-relaxed text-[var(--color-muted)]">
          Máy móc thiết bị nhập khẩu chính hãng cho nhà xưởng và doanh nghiệp sản xuất. Gọi hoặc gửi yêu cầu
          để nhận báo giá trong ngày.
        </p>
      </section>

      {/* ===== THANH DANH MỤC ===== */}
      <CategoryMegaMenu categories={categories} />

      {/* ===== GOM NHÓM THEO DANH MỤC ===== */}
      <section className="mx-auto max-w-[1320px] space-y-20 px-4 py-14 md:px-8 md:py-20">
        {categories.length === 0 ? (
          <div className="text-[var(--color-muted)]">Chưa có sản phẩm.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-[190px]">
              <div className="mb-8 flex items-end justify-between gap-4 border-t border-[var(--color-line)] pt-6">
                <h2 className="display-lg text-[clamp(24px,2.0vw,27px)]">{cat.name}</h2>
                <Link href={`/${cat.slug}`} className="link-underline shrink-0">
                  Xem tất cả
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
                {cat.items.map((p) => (
                  <ProductCard key={p.id} p={p} as="h3" />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* ===== KÊU GỌI TƯ VẤN ===== */}
      <section className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <div className="flex flex-col justify-between gap-8 rounded-[32px] bg-[var(--color-navy)] p-[clamp(32px,5vw,72px)] text-[var(--color-bg)] md:flex-row md:items-center">
          <h2 className="display-lg max-w-[620px] text-[clamp(24px,2.2vw,30px)]">
            Chưa biết chọn máy nào?
            <br />
            <span className="text-[#8A94A8]">Kỹ thuật viên tư vấn miễn phí.</span>
          </h2>
          <a href={`tel:${SITE.phone}`} className="btn-pill-primary min-h-[54px] px-8 text-[16px]">
            Gọi {SITE.phoneDisplay}
          </a>
        </div>
      </section>
    </main>
  );
}
