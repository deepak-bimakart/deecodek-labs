import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const mediaUpdateSchema = z.object({
  altText: z.string().optional(),
  description: z.string().optional(),
  originalName: z.string().optional(),
});

// PATCH /api/admin/media/[id] — update alt text, description, name
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "media.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = mediaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const asset = await db.mediaAsset.update({ where: { id }, data: parsed.data });
  await audit({ action: "update", entityType: "media", entityId: id, userId: user.id });
  return NextResponse.json({ asset });
}

// DELETE
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "media.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete file from disk
  try {
    const filepath = path.join(process.cwd(), "public", asset.storageKey);
    await unlink(filepath);
  } catch (e) {
    // File may already be missing — continue with DB delete
  }

  await db.mediaAsset.delete({ where: { id } });
  await audit({ action: "delete", entityType: "media", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
