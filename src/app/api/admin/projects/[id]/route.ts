import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";
import { createSlugChangeRedirect } from "@/lib/slug-redirect";

const projectUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  category: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  caseStudy: z.string().optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  projectUrl: z.string().optional(),
  isFeatured: z.boolean().optional(),
  completionDate: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  seo: nestedSeoSchema,
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "projects.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { completionDate, seo, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (rest.gallery !== undefined) data.gallery = JSON.stringify(rest.gallery);
  if (rest.technologies !== undefined) data.technologies = JSON.stringify(rest.technologies);
  if (completionDate !== undefined) data.completionDate = completionDate ? new Date(completionDate) : null;

  const existing = await db.project.findUnique({
    where: { id },
    select: { slug: true, status: true, seoId: true, name: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (seo !== undefined) {
    const seoId = await upsertSeoRecord(existing.seoId, seo, {
      fallbackTitle: rest.name ?? existing.name,
    });
    if (seoId !== undefined) data.seoId = seoId;
  }

  const project = await db.project.update({ where: { id }, data, include: { seo: true } });

  if (rest.slug && rest.slug !== existing.slug) {
    const willBePublic =
      (rest.status ?? existing.status) === "PUBLISHED" || project.status === "PUBLISHED";
    await createSlugChangeRedirect({
      kind: "project",
      oldSlug: existing.slug,
      newSlug: rest.slug,
      isPublic: willBePublic,
    });
  }

  revalidatePath("/work");
  revalidatePath(`/work/${project.slug}`);
  if (rest.slug && rest.slug !== existing.slug) {
    revalidatePath(`/work/${existing.slug}`);
  }

  await audit({ action: "update", entityType: "project", entityId: id, userId: user.id });
  return NextResponse.json({ project });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "projects.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.project.delete({ where: { id } });
  await audit({ action: "delete", entityType: "project", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
