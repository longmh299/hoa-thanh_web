// app/page.tsx — Trang chủ (giao diện B). Phần hiển thị nằm ở components/home/HomeB.tsx
import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { SITE, abs } from "@/lib/site";
import HomeB, { type HomeCategoryBlock } from "@/components/home/HomeB";

export const revalidate = 60;
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: { absolute: `Máy móc thiết bị nhập khẩu chính hãng | ${SITE.name}` },
  description: `${SITE.legalName} nhập khẩu và phân phối máy móc thiết bị cho nhà xưởng, doanh nghiệp sản xuất: hàng chính hãng, giá tốt tại kho, giao hàng – lắp đặt – bảo hành tận nơi toàn quốc.`,
  alternates: { canonical: abs("/") },
  openGraph: {
    type: "website",
    url: abs("/"),
    siteName: SITE.name,
    title: `${SITE.name} | Máy móc thiết bị nhập khẩu chính hãng`,
    description: "Máy móc thiết bị nhập khẩu chính hãng, giá tốt tại kho, giao hàng và bảo hành tận nơi toàn quốc.",
    locale: "vi_VN",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: SITE.name }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

const productSelect = {
  id: true,
  slug: true,
  name: true,
  short: true,
  coverImage: true,
  price: true,
  isFeatured: true,
  category: { select: { id: true, name: true } },
} as const;

const getHomepageData = cache(async () => {
  const [sidebarCategories, featured, featuredCats, posts] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.findMany({
      where: { published: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: productSelect,
    }),
    prisma.category.findMany({
      where: { isFeatured: true },
      orderBy: { order: "asc" },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        banner: true,
        ogImage: true,
        metaDescription: true,
        children: { select: { id: true } },
      },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        excerpt: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  // Chưa đánh dấu máy "Nổi bật" → lấy máy mới nhất
  let bestSellers = featured;
  if (featured.length === 0) {
    bestSellers = await prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: productSelect,
    });
  }

  // Chưa đánh dấu danh mục "Nổi bật" → lấy 3 danh mục cấp 1 đầu tiên
  const blocksSource = featuredCats.length
    ? featuredCats
    : await prisma.category.findMany({
        where: { parentId: null },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        take: 3,
        select: {
          id: true,
          name: true,
          slug: true,
          banner: true,
          ogImage: true,
          metaDescription: true,
          children: { select: { id: true } },
        },
      });

  const categoryBlocks: HomeCategoryBlock[] = await Promise.all(
    blocksSource.map(async (c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      banner: c.banner || c.ogImage,
      metaDescription: c.metaDescription,
      products: await prisma.product.findMany({
        where: { published: true, categoryId: { in: [c.id, ...c.children.map((x) => x.id)] } },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 4,
        select: productSelect,
      }),
    }))
  );

  return { sidebarCategories, bestSellers, categoryBlocks, posts };
});

export default async function HomePage() {
  const data = await getHomepageData();
  return <HomeB {...data} />;
}
