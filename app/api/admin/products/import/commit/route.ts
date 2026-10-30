// POST /api/admin/products/import/commit — nhập 1 nhóm nhỏ sản phẩm (client gửi lần lượt từng nhóm)
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/lib/auth";
import { importRows } from "@/lib/product-import-run";
import type { CheckedRow, ImportOptions } from "@/lib/product-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const rows: CheckedRow[] = Array.isArray(body?.rows) ? body.rows.slice(0, 25) : [];
    const opt: ImportOptions = {
      updateExisting: Boolean(body?.options?.updateExisting),
      createCategories: Boolean(body?.options?.createCategories),
      copyImages: Boolean(body?.options?.copyImages),
      importHidden: Boolean(body?.options?.importHidden),
    };
    const catMap: Record<string, number> = body?.catMap && typeof body.catMap === "object" ? body.catMap : {};

    const out = await importRows(rows, opt, catMap);

    if (body?.last) {
      revalidatePath("/admin/products");
      revalidatePath("/san-pham");
      revalidatePath("/");
      revalidatePath("/[slug]", "page");
      revalidatePath("/san-pham/[slug]", "page");
    }
    return NextResponse.json({ ok: true, ...out });
  } catch (e: any) {
    console.error("IMPORT_COMMIT_ERROR", e);
    return NextResponse.json({ ok: false, error: "Lỗi máy chủ khi nhập." }, { status: 500 });
  }
}
