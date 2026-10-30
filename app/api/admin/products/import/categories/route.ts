// POST /api/admin/products/import/categories — tạo các danh mục chưa có, trả về map tên → id
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/lib/auth";
import { ensureCategories } from "@/lib/product-import-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const names: string[] = Array.isArray(body?.names) ? body.names.map(String).slice(0, 500) : [];
    const { map, created } = await ensureCategories(names, Boolean(body?.create));
    if (created.length) {
      revalidatePath("/admin/categories");
      revalidatePath("/san-pham");
    }
    return NextResponse.json({ ok: true, map, created });
  } catch (e: any) {
    console.error("IMPORT_CATEGORIES_ERROR", e);
    return NextResponse.json({ ok: false, error: "Không tạo được danh mục." }, { status: 500 });
  }
}
