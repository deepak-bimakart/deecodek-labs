import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  tagline: z.string().optional(),
  category: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  richContent: z.string().optional(),
  status: z.enum(["coming_soon", "in_development", "launched", "archived"]).default("in_development"),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  externalUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  seo: nestedSeoSchema,
  features: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    sortOrder: z.number().int().default(0),
  })).default([]),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "products.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const products = await db.product.findMany({
    where: search ? { name: { contains: search } } : {},
    orderBy: { sortOrder: "asc" },
    include: { features: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "products.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const { features, seo, ...productData } = parsed.data;
  const seoId = await upsertSeoRecord(null, seo ?? undefined);
  const product = await db.product.create({
    data: {
      ...productData,
      gallery: JSON.stringify(productData.gallery),
      technologies: JSON.stringify(productData.technologies),
      ...(seoId ? { seoId } : {}),
      features: {
        create: features.map((f, i) => ({
          title: f.title,
          description: f.description,
          sortOrder: f.sortOrder || i,
        })),
      },
    },
    include: { features: true, seo: true },
  });

  await audit({ action: "create", entityType: "product", entityId: product.id, userId: user.id });
  return NextResponse.json({ product }, { status: 201 });
}
