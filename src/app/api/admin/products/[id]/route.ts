import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";
import { createSlugChangeRedirect } from "@/lib/slug-redirect";

const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  tagline: z.string().optional(),
  category: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  richContent: z.string().optional(),
  status: z.enum(["coming_soon", "in_development", "launched", "archived"]).optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  externalUrl: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  seo: nestedSeoSchema,
  features: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    sortOrder: z.number().int().default(0),
  })).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "products.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { features, seo, ...productData } = parsed.data;
  const data: any = { ...productData };
  if (productData.gallery !== undefined) data.gallery = JSON.stringify(productData.gallery);
  if (productData.technologies !== undefined) data.technologies = JSON.stringify(productData.technologies);

  const existing = await db.product.findUnique({
    where: { id },
    select: { slug: true, status: true, seoId: true, name: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (seo !== undefined) {
    const seoId = await upsertSeoRecord(existing.seoId, seo, {
      fallbackTitle: productData.name ?? existing.name,
    });
    if (seoId !== undefined) data.seoId = seoId;
  }

  // Update features if provided
  if (features !== undefined) {
    await db.productFeature.deleteMany({ where: { productId: id } });
    if (features.length > 0) {
      data.features = {
        create: features.map((f, i) => ({
          title: f.title,
          description: f.description,
          sortOrder: f.sortOrder || i,
        })),
      };
    }
  }

  const product = await db.product.update({
    where: { id },
    data,
    include: { features: { orderBy: { sortOrder: "asc" } }, seo: true },
  });

  if (productData.slug && productData.slug !== existing.slug) {
    const nextStatus = productData.status ?? existing.status;
    const isPublic = nextStatus !== "archived";
    await createSlugChangeRedirect({
      kind: "product",
      oldSlug: existing.slug,
      newSlug: productData.slug,
      isPublic,
    });
  }

  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  if (productData.slug && productData.slug !== existing.slug) {
    revalidatePath(`/products/${existing.slug}`);
  }

  await audit({ action: "update", entityType: "product", entityId: id, userId: user.id });
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "products.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.product.delete({ where: { id } });
  await audit({ action: "delete", entityType: "product", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
