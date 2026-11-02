import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";

const projectSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  category: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  caseStudy: z.string().optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  projectUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  completionDate: z.string().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  seo: nestedSeoSchema,
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "projects.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const projects = await db.project.findMany({
    where: search ? { name: { contains: search } } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "projects.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.project.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const { completionDate, seo, ...rest } = parsed.data;
  const seoId = await upsertSeoRecord(null, seo ?? undefined);
  const project = await db.project.create({
    data: {
      ...rest,
      gallery: JSON.stringify(rest.gallery),
      technologies: JSON.stringify(rest.technologies),
      completionDate: completionDate ? new Date(completionDate) : null,
      ...(seoId ? { seoId } : {}),
    },
    include: { seo: true },
  });

  await audit({ action: "create", entityType: "project", entityId: project.id, userId: user.id });
  return NextResponse.json({ project }, { status: 201 });
}
