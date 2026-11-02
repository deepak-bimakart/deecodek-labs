import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";

const serviceUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  richContent: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  seo: nestedSeoSchema,
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "services.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = serviceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { seo, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (rest.technologies !== undefined) data.technologies = JSON.stringify(rest.technologies);
  if (rest.capabilities !== undefined) data.capabilities = JSON.stringify(rest.capabilities);
  if (rest.status === "PUBLISHED") data.publishedAt = new Date();

  if (seo !== undefined) {
    const existing = await db.service.findUnique({ where: { id }, select: { seoId: true } });
    const seoId = await upsertSeoRecord(existing?.seoId, seo);
    if (seoId !== undefined) data.seoId = seoId;
  }

  const service = await db.service.update({ where: { id }, data, include: { seo: true } });
  await audit({ action: "update", entityType: "service", entityId: id, userId: user.id });
  return NextResponse.json({ service });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "services.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.service.delete({ where: { id } });
  await audit({ action: "delete", entityType: "service", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
