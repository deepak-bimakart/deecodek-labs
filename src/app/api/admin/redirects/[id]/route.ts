import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const updateSchema = z.object({
  fromPath: z.string().min(1).max(500).optional(),
  toPath: z.string().min(1).max(500).optional(),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.redirect.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = { ...parsed.data };
  if (data.fromPath && !data.fromPath.startsWith("/")) {
    data.fromPath = `/${data.fromPath}`;
  }

  if (data.fromPath && data.fromPath !== existing.fromPath) {
    const clash = await db.redirect.findUnique({ where: { fromPath: data.fromPath } });
    if (clash) {
      return NextResponse.json({ error: "A redirect from this path already exists" }, { status: 409 });
    }
  }

  const redirect = await db.redirect.update({ where: { id }, data });
  await audit({ action: "update", entityType: "redirect", entityId: id, userId: user.id });
  return NextResponse.json({ redirect });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await db.redirect.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.redirect.delete({ where: { id } });
  await audit({ action: "delete", entityType: "redirect", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
