import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { seoFieldsSchema } from "@/lib/seo";

const seoSchema = seoFieldsSchema.extend({
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
});

// GET /api/admin/seo — list all seo records
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.view") && !can(user.role, "settings.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const seoRecords = await db.seoMetadata.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      pages: { select: { id: true, title: true, slug: true } },
      services: { select: { id: true, title: true, slug: true } },
      products: { select: { id: true, name: true, slug: true } },
      projects: { select: { id: true, name: true, slug: true } },
      posts: { select: { id: true, title: true, slug: true } },
    },
  });
  return NextResponse.json({ seoRecords });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.manage") && !can(user.role, "settings.update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = seoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const seo = await db.seoMetadata.create({ data: parsed.data });
  await audit({ action: "create", entityType: "seo", entityId: seo.id, userId: user.id });
  return NextResponse.json({ seo }, { status: 201 });
}
