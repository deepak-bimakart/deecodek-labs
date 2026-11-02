import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";

const postSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  readingMinutes: z.number().int().default(5),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  publishedAt: z.string().optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  seo: nestedSeoSchema,
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "blog.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  const posts = await db.blogPost.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, email: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "blog.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const { tagIds, publishedAt, seo, ...rest } = parsed.data;
  const seoId = await upsertSeoRecord(null, seo ?? undefined);
  const post = await db.blogPost.create({
    data: {
      ...rest,
      authorId: rest.authorId ?? user.id,
      publishedAt: publishedAt ? new Date(publishedAt) : (rest.status === "PUBLISHED" ? new Date() : null),
      ...(seoId ? { seoId } : {}),
      tags: tagIds.length > 0 ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
    },
    include: { category: true, tags: { include: { tag: true } }, seo: true },
  });

  await audit({ action: "create", entityType: "blog_post", entityId: post.id, userId: user.id });
  return NextResponse.json({ post }, { status: 201 });
}
