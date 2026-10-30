// app/admin/products/import/page.tsx — Nhập sản phẩm từ Excel
import ProductImport from "@/components/admin/ProductImport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Nhập sản phẩm từ Excel" };

export default function ImportProductsPage() {
  return <ProductImport />;
}
