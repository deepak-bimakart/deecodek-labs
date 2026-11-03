import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { seoFieldsSchema } from "@/lib/seo";
import { computeSeoScore } from "@/lib/seo-score";

const seoUpdateSchema = seoFieldsSchema;

async function revalidateAttachedPaths(seoId: string) {
  const seo = await db.seoMetadata.findUnique({
    where: { id: seoId },
    include: {
      pages: { select: { slug: true, isHomepage: true } },
      services: { select: { slug: true } },
      products: { select: { slug: true } },
      projects: { select: { slug: true } },
      posts: { select: { slug: true } },
    },
  });
  if (!seo) return;

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  for (const p of seo.pages) {
    if (p.isHomepage) revalidatePath("/");
    else revalidatePath(`/${p.slug}`);
  }
  for (const s of seo.services) revalidatePath(`/services/${s.slug}`);
  for (const p of seo.products) revalidatePath(`/products/${p.slug}`);
  for (const p of seo.projects) revalidatePath(`/work/${p.slug}`);
  for (const p of seo.posts) revalidatePath(`/blog/${p.slug}`);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.manage") && !can(user.role, "settings.update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = seoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const scored = computeSeoScore(parsed.data);
  const seo = await db.seoMetadata.update({
    where: { id },
    data: {
      ...parsed.data,
      seoScore: parsed.data.seoScore ?? scored.score,
    },
  });

  await revalidateAttachedPaths(id);
  await audit({ action: "update", entityType: "seo", entityId: id, userId: user.id });
  return NextResponse.json({ seo });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.manage") && !can(user.role, "settings.update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.seoMetadata.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  await audit({ action: "delete", entityType: "seo", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
