import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { SECTION_TYPE_MAP, validateSectionContent } from "@/lib/sections";

// GET /api/admin/pages/[id]/sections — list sections for a page
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const sections = await db.pageSection.findMany({
    where: { pageId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ sections });
}

const sectionCreateSchema = z.object({
  sectionType: z.string().refine((v) => SECTION_TYPE_MAP[v], "Unknown section type"),
  title: z.string().optional(),
  content: z.record(z.any()).default({}),
  designVariant: z.string().default("default"),
  themeVariant: z.enum(["auto", "light", "dark"]).default("auto"),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

// POST /api/admin/pages/[id]/sections — add section
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: pageId } = await params;
  const body = await req.json();
  const parsed = sectionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  // Validate content against section schema
  const contentValidation = validateSectionContent(parsed.data.sectionType, parsed.data.content);
  if (!contentValidation.success) {
    return NextResponse.json(
      { error: "Section content invalid", details: contentValidation.error.flatten() },
      { status: 400 }
    );
  }

  // Determine sort order — append to end if 0
  let sortOrder = parsed.data.sortOrder;
  if (sortOrder === 0) {
    const count = await db.pageSection.count({ where: { pageId } });
    sortOrder = count;
  }

  const section = await db.pageSection.create({
    data: {
      pageId,
      sectionType: parsed.data.sectionType,
      title: parsed.data.title,
      content: JSON.stringify(parsed.data.content),
      designVariant: parsed.data.designVariant,
      themeVariant: parsed.data.themeVariant,
      sortOrder,
      isVisible: parsed.data.isVisible,
    },
  });

  await audit({
    action: "create",
    entityType: "section",
    entityId: section.id,
    userId: user.id,
    metadata: { pageId, sectionType: section.sectionType },
  });

  return NextResponse.json({ section }, { status: 201 });
}
