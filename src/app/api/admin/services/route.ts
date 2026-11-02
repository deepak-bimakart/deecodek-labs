import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";

const serviceSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  summary: z.string().optional(),
  description: z.string().optional(),
  richContent: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  seo: nestedSeoSchema,
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "services.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");

  const services = await db.service.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "services.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.service.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const { seo, ...rest } = parsed.data;
  const seoId = await upsertSeoRecord(null, seo ?? undefined);
  const data: any = {
    ...rest,
    technologies: JSON.stringify(rest.technologies),
    capabilities: JSON.stringify(rest.capabilities),
    ...(seoId ? { seoId } : {}),
  };
  if (rest.status === "PUBLISHED") data.publishedAt = new Date();

  const service = await db.service.create({ data, include: { seo: true } });
  await audit({ action: "create", entityType: "service", entityId: service.id, userId: user.id });
  return NextResponse.json({ service }, { status: 201 });
}
