// POST /api/admin/products/import/preview — đọc file Excel + kiểm tra từng dòng. KHÔNG ghi gì vào database.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { denyIfNotAdmin } from "@/lib/auth";
import { checkRows, parseWorkbook, catKey, type ImportOptions } from "@/lib/product-import";
import { cloudinaryReady } from "@/lib/product-import-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 1000;

export async function POST(req: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ ok: false, error: "Chưa chọn file." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "File lớn hơn 10MB." }, { status: 400 });

    let opt: ImportOptions = { updateExisting: true, createCategories: true, copyImages: true, importHidden: false };
    try {
      opt = { ...opt, ...JSON.parse(String(form.get("options") || "{}")) };
    } catch {}

    let parsed;
    try {
      parsed = await parseWorkbook(await file.arrayBuffer());
    } catch (e: any) {
      const msg = String(e?.message || "");
      return NextResponse.json(
        { ok: false, error: msg.startsWith("Không tìm thấy") ? msg : "Không đọc được file. Hãy lưu lại dạng .xlsx (Excel Workbook) rồi thử lại." },
        { status: 400 }
      );
    }
    if (!parsed.rows.length) return NextResponse.json({ ok: false, error: "File không có dòng sản phẩm nào." }, { status: 400 });
    if (parsed.rows.length > MAX_ROWS)
      return NextResponse.json({ ok: false, error: `File có ${parsed.rows.length} dòng, tối đa ${MAX_ROWS} dòng mỗi lần. Hãy chia nhỏ file.` }, { status: 400 });

    const [products, categories] = await Promise.all([
      prisma.product.findMany({ select: { slug: true, sku: true } }),
      prisma.category.findMany({ select: { name: true, slug: true } }),
    ]);
    const rows = checkRows(parsed.rows, { products, categories }, opt);

    const newCats = [...new Map(rows.filter((r) => r.newCategory && r.status !== "error").map((r) => [catKey(r.category), r.category])).values()];
    const allCats = new Set(rows.filter((r) => r.category).map((r) => catKey(r.category)));
    const count = (s: string) => rows.filter((r) => r.status === s).length;

    return NextResponse.json({
      ok: true,
      sheet: parsed.sheet,
      columns: parsed.columns,
      rows,
      summary: {
        total: rows.length,
        new: count("new"),
        update: count("update"),
        skip: count("skip"),
        error: count("error"),
        warning: rows.filter((r) => r.status !== "error" && r.warnings.length).length,
        categories: allCats.size,
        newCategories: newCats,
        images: rows.reduce((n, r) => n + (r.coverImage ? 1 : 0) + r.gallery.length, 0),
      },
      cloudinary: cloudinaryReady(),
    });
  } catch (e: any) {
    console.error("IMPORT_PREVIEW_ERROR", e);
    return NextResponse.json({ ok: false, error: "Lỗi máy chủ khi đọc file." }, { status: 500 });
  }
}
