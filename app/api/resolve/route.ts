// app/api/resolve/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Các entity hợp lệ
const ENTITIES = ['product', 'post', 'category', 'postCategory'] as const;
type Entity = typeof ENTITIES[number];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entityRaw = String(searchParams.get('entity') || '').trim();
    const slugRaw = String(searchParams.get('slug') || '').trim();

    // Validate input
    if (!entityRaw || !slugRaw) {
      return NextResponse.json({ ok: false, error: 'Missing entity/slug' }, { status: 400 });
    }
    if (!ENTITIES.includes(entityRaw as Entity)) {
      return NextResponse.json({ ok: false, error: 'Invalid entity' }, { status: 400 });
    }
    const entity = entityRaw as Entity;
    const slug = decodeURIComponent(slugRaw);

    // Map model theo entity
    const modelMap: Record<Entity, any> = {
      product: prisma.product,
      post: prisma.post,
      category: prisma.category,
      postCategory: prisma.postCategory,
    };

    // Tìm theo slug (case-insensitive cho chắc)
    const exists = await modelMap[entity].findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' } },
      select: { slug: true },
    });

    if (exists) {
      const res = NextResponse.json({ ok: true, entity, slug: exists.slug });
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res;
    }

    // Không thấy → thử bảng redirect (nếu có)
    try {
      const red = await prisma.slugRedirect.findUnique({
        where: { fromSlug: slug },
      });
      if (red && red.entityType === entity && red.toSlug) {
        const res = NextResponse.json({ ok: true, entity, slug: red.toSlug, redirected: true });
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return res;
      }
    } catch {
      // nếu không có bảng slugRedirect thì bỏ qua
    }

    return NextResponse.json({ ok: false, notFound: true }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Internal error' },
      { status: 500 },
    );
  }
}
