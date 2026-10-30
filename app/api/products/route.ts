// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const sortMap = (s: string) => {
  switch (s) {
    case "oldest":
      return [{ createdAt: "asc" as const }];
    case "name":
      return [{ name: "asc" as const }];
    case "featured":
      return [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];
    default:
      return [{ createdAt: "desc" as const }]; // newest
  }
};

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;

    const q = (sp.get("q") || "").trim();
    const cat = (sp.get("cat") || "").trim();
    const sort = (sp.get("sort") || "newest").trim().toLowerCase();
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const size = Math.max(1, Math.min(48, parseInt(sp.get("size") || "12", 10)));

    // Build where
    const where: any = { published: true, AND: [] as any[] };

    if (cat) {
      // nếu category là relation có slug:string
      where.AND.push({ category: { is: { slug: { equals: cat } } } });
    }

    if (q) {
      where.AND.push({
        OR: [
          { name:  { contains: q, mode: "insensitive" } },
          { short: { contains: q, mode: "insensitive" } },
          { sku:   { contains: q, mode: "insensitive" } },
          { category: { is: { name: { contains: q, mode: "insensitive" } } } },
        ],
      });
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: sortMap(sort),
        skip: (page - 1) * size,
        take: size,
        include: {
          category: { select: { name: true, slug: true } },
          images:   { orderBy: { sort: "asc" }, take: 1, select: { url: true, alt: true } },
        },
      }),
    ]);

    const res = NextResponse.json({ page, size, total, items });
    // cache nhẹ trên CDN
    res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
