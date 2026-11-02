import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { features: { orderBy: { sortOrder: "asc" } }, seo: true },
  });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit: {product.name}
        </h1>
      </div>
      <ProductForm mode="edit" productId={product.id} initial={product} />
    </div>
  );
}
