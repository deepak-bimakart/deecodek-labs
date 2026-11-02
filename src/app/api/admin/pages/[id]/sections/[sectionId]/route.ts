import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { validateSectionContent } from "@/lib/sections";

const sectionUpdateSchema = z.object({
  sectionType: z.string().optional(),
  title: z.string().optional(),
  content: z.record(z.any()).optional(),
  designVariant: z.string().optional(),
  themeVariant: z.enum(["auto", "light", "dark"]).optional(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

// PATCH /api/admin/pages/[id]/sections/[sectionId]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: pageId, sectionId } = await params;
  const body = await req.json();
  const parsed = sectionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.pageSection.findUnique({ where: { id: sectionId } });
  if (!existing || existing.pageId !== pageId) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  // Validate content if provided
  if (parsed.data.content !== undefined) {
    const sectionType = parsed.data.sectionType ?? existing.sectionType;
    const validation = validateSectionContent(sectionType, parsed.data.content);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Section content invalid", details: validation.error.flatten() },
        { status: 400 }
      );
    }
  }

  const data: any = {};
  if (parsed.data.sectionType !== undefined) data.sectionType = parsed.data.sectionType;
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.content !== undefined) data.content = JSON.stringify(parsed.data.content);
  if (parsed.data.designVariant !== undefined) data.designVariant = parsed.data.designVariant;
  if (parsed.data.themeVariant !== undefined) data.themeVariant = parsed.data.themeVariant;
  if (parsed.data.sortOrder !== undefined) data.sortOrder = parsed.data.sortOrder;
  if (parsed.data.isVisible !== undefined) data.isVisible = parsed.data.isVisible;

  const section = await db.pageSection.update({ where: { id: sectionId }, data });

  await audit({
    action: "update",
    entityType: "section",
    entityId: sectionId,
    userId: user.id,
    metadata: { pageId, ...parsed.data },
  });

  return NextResponse.json({ section });
}

// DELETE
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: pageId, sectionId } = await params;
  await db.pageSection.delete({ where: { id: sectionId } });
  await audit({ action: "delete", entityType: "section", entityId: sectionId, userId: user.id, metadata: { pageId } });
  return NextResponse.json({ ok: true });
}
