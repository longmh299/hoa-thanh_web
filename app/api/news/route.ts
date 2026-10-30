// app/api/news/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const tag = (searchParams.get("tag") || "").trim();
  const cat = (searchParams.get("category") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("perPage") || "10", 10)));
  const skip = (page - 1) * perPage;

  const insensitive: Prisma.QueryMode = Prisma.QueryMode.insensitive;

  const where: Prisma.PostWhereInput = {
    published: true,
    noindex: false,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: insensitive } },
            { slug: { contains: q, mode: insensitive } },
            { excerpt: { contains: q, mode: insensitive } },
            { content: { contains: q, mode: insensitive } },
          ],
        }
      : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    // lọc theo slug của category (quan hệ optional) cần dùng { is: { ... } }
    ...(cat ? { category: { is: { slug: cat } } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, slug: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  });
}
