// app/api/slug-unique/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Entity = 'product' | 'post' | 'category' | 'postCategory';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slugRaw = searchParams.get('slug') ?? '';
    const entity = (searchParams.get('entity') ?? '') as Entity;
    const excludeIdRaw = searchParams.get('excludeId'); // string | null

    const slug = decodeURIComponent(slugRaw).trim();
    if (!slug || !entity) {
      return NextResponse.json({ ok: false, error: 'Missing entity/slug' }, { status: 400 });
    }

    const modelMap: Record<Entity, any> = {
      product: prisma.product,
      post: prisma.post,
      category: prisma.category,
      postCategory: prisma.postCategory,
    };
    const model = modelMap[entity];
    if (!model) {
      return NextResponse.json({ ok: false, error: 'Invalid entity' }, { status: 400 });
    }

    // Ép excludeId về number nếu hợp lệ
    const excludeIdNum =
      excludeIdRaw === null || excludeIdRaw === '' ? undefined : Number(excludeIdRaw);

    const existed = await model.findFirst({
      where: {
        slug: { equals: slug, mode: 'insensitive' }, // tránh trùng khác hoa/thường
        NOT:
          excludeIdNum !== undefined && Number.isFinite(excludeIdNum)
            ? { id: excludeIdNum }
            : undefined,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, unique: !existed });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
