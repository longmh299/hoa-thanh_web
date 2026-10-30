// GET /api/admin/products/import/template — tải file Excel mẫu
import { denyIfNotAdmin } from "@/lib/auth";
import { buildWorkbook } from "@/lib/product-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  const buf = await buildWorkbook(null);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="mau-nhap-san-pham.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
