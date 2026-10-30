// GET /api/admin/products/export — xuất toàn bộ sản phẩm ra Excel (cùng định dạng file nhập → sửa xong nhập lại được)
import { denyIfNotAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWorkbook } from "@/lib/product-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  const products = await prisma.product.findMany({
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    select: {
      name: true, slug: true, price: true, sku: true, published: true, isFeatured: true, coverImage: true,
      short: true, description: true, metaTitle: true, metaDescription: true, videoUrl: true,
      power: true, voltage: true, weight: true, dimensions: true, material: true, warranty: true,
      category: { select: { name: true } },
      images: { orderBy: { sort: "asc" }, select: { url: true } },
      attributes: { select: { name: true, value: true } },
    },
  });
  const buf = await buildWorkbook(products);
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="san-pham-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
