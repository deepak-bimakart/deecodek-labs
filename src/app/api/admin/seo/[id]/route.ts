import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { seoFieldsSchema } from "@/lib/seo";

const seoUpdateSchema = seoFieldsSchema;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = seoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const seo = await db.seoMetadata.update({ where: { id }, data: parsed.data });
  await audit({ action: "update", entityType: "seo", entityId: id, userId: user.id });
  return NextResponse.json({ seo });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.seoMetadata.delete({ where: { id } });
  await audit({ action: "delete", entityType: "seo", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
