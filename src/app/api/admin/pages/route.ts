import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";

// ──────────────────────────────────────────────────────────────────────
// /api/admin/pages
// GET  — list pages (paginated)
// POST — create page
// ──────────────────────────────────────────────────────────────────────

const pageCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, dashes only"),
  description: z.string().optional(),
  pageType: z.enum(["homepage", "about", "custom"]).default("custom"),
  isHomepage: z.boolean().default(false),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  seo: nestedSeoSchema,
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "50");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  const pages = await db.page.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    include: {
      sections: { select: { id: true, sectionType: true } },
      updatedBy: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.page.count({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
  });

  return NextResponse.json({ pages, total, page, limit });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = pageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.page.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const { seo, ...rest } = parsed.data;
  const seoId = await upsertSeoRecord(null, seo ?? undefined);
  const page = await db.page.create({
    data: {
      ...rest,
      updatedById: user.id,
      publishedAt: rest.status === "PUBLISHED" ? new Date() : null,
      ...(seoId ? { seoId } : {}),
    },
    include: { seo: true },
  });

  await audit({
    action: "create",
    entityType: "page",
    entityId: page.id,
    userId: user.id,
    metadata: { title: page.title, slug: page.slug },
  });

  return NextResponse.json({ page }, { status: 201 });
}
