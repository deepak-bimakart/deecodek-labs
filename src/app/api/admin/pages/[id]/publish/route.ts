import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

// POST /api/admin/pages/[id]/publish — set status to PUBLISHED + create revision
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.publish")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
    include: { sections: true },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Create revision snapshot before publishing
  const lastRevision = await db.contentRevision.findFirst({
    where: { entityId: id, entityType: "page" },
    orderBy: { revision: "desc" },
  });
  const nextRevision = (lastRevision?.revision ?? 0) + 1;

  await db.contentRevision.create({
    data: {
      entityId: id,
      entityType: "page",
      snapshot: JSON.stringify({
        title: page.title,
        slug: page.slug,
        description: page.description,
        status: page.status,
        sections: page.sections.map((s) => ({
          id: s.id,
          sectionType: s.sectionType,
          title: s.title,
          content: s.content,
          sortOrder: s.sortOrder,
          isVisible: s.isVisible,
        })),
      }),
      revision: nextRevision,
      createdById: user.id,
    },
  });

  const updated = await db.page.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      updatedById: user.id,
    },
  });

  await audit({
    action: "publish",
    entityType: "page",
    entityId: id,
    userId: user.id,
    metadata: { revision: nextRevision },
  });

  return NextResponse.json({ page: updated });
}
