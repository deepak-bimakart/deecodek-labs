import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";

// GET /api/admin/pages/[id] — single page with sections
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      seo: true,
      updatedBy: { select: { name: true, email: true } },
    },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

const pageUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  pageType: z.enum(["homepage", "about", "custom"]).optional(),
  isHomepage: z.boolean().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  seo: nestedSeoSchema,
});

// PATCH /api/admin/pages/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = pageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { seo, ...rest } = parsed.data;
  const data: any = { ...rest, updatedById: user.id };
  if (rest.status === "PUBLISHED") data.publishedAt = new Date();

  if (seo !== undefined) {
    const existing = await db.page.findUnique({ where: { id }, select: { seoId: true } });
    const seoId = await upsertSeoRecord(existing?.seoId, seo);
    if (seoId !== undefined) data.seoId = seoId;
  }

  const page = await db.page.update({ where: { id }, data, include: { seo: true } });
  await audit({ action: "update", entityType: "page", entityId: id, userId: user.id, metadata: rest });
  return NextResponse.json({ page });
}

// DELETE /api/admin/pages/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.page.delete({ where: { id } });
  await audit({ action: "delete", entityType: "page", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
