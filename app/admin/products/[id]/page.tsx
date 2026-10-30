// app/admin/products/[id]/page.tsx
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/products/${id}/edit`);
}
