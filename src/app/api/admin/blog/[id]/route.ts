import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { nestedSeoSchema } from "@/lib/seo";
import { upsertSeoRecord } from "@/lib/attach-seo";
import { createSlugChangeRedirect } from "@/lib/slug-redirect";

const postUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  readingMinutes: z.number().int().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
  authorId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  seo: nestedSeoSchema,
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "blog.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = postUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { tagIds, publishedAt, seo, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (publishedAt !== undefined) data.publishedAt = publishedAt ? new Date(publishedAt) : null;

  const existing = await db.blogPost.findUnique({
    where: { id },
    select: { slug: true, status: true, seoId: true, publishedAt: true, title: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // When publishing, ensure publishedAt is set
  if (rest.status === "PUBLISHED" && publishedAt === undefined) {
    if (!existing.publishedAt) data.publishedAt = new Date();
  }

  if (seo !== undefined) {
    const seoId = await upsertSeoRecord(existing.seoId, seo, {
      fallbackTitle: rest.title ?? existing.title,
    });
    if (seoId !== undefined) data.seoId = seoId;
  }

  // Sync tags
  if (tagIds !== undefined) {
    await db.blogPostTag.deleteMany({ where: { postId: id } });
    if (tagIds.length > 0) {
      await db.blogPostTag.createMany({
        data: tagIds.map((tagId) => ({ postId: id, tagId })),
      });
    }
  }

  const post = await db.blogPost.update({
    where: { id },
    data,
    include: { category: true, tags: { include: { tag: true } }, seo: true },
  });

  if (rest.slug && rest.slug !== existing.slug) {
    const willBePublic =
      (rest.status ?? existing.status) === "PUBLISHED" || post.status === "PUBLISHED";
    await createSlugChangeRedirect({
      kind: "blog",
      oldSlug: existing.slug,
      newSlug: rest.slug,
      isPublic: willBePublic,
    });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  if (rest.slug && rest.slug !== existing.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }

  await audit({ action: "update", entityType: "blog_post", entityId: id, userId: user.id });
  return NextResponse.json({ post });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "blog.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.blogPost.delete({ where: { id } });
  await audit({ action: "delete", entityType: "blog_post", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
