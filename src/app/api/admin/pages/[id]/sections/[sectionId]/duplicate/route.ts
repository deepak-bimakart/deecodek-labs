import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

// POST /api/admin/pages/[id]/sections/[sectionId]/duplicate
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: pageId, sectionId } = await params;
  const original = await db.pageSection.findUnique({ where: { id: sectionId } });
  if (!original || original.pageId !== pageId) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const count = await db.pageSection.count({ where: { pageId } });
  const duplicate = await db.pageSection.create({
    data: {
      pageId,
      sectionType: original.sectionType,
      title: original.title ? `${original.title} (copy)` : null,
      content: original.content,
      designVariant: original.designVariant,
      themeVariant: original.themeVariant,
      sortOrder: count, // append to end
      isVisible: original.isVisible,
    },
  });

  await audit({
    action: "duplicate",
    entityType: "section",
    entityId: duplicate.id,
    userId: user.id,
    metadata: { pageId, sourceSectionId: sectionId },
  });

  return NextResponse.json({ section: duplicate }, { status: 201 });
}
