import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";
import { upsertSeoRecord } from "@/lib/attach-seo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.view") && !can(user.role, "settings.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [pages, posts] = await Promise.all([
    db.page.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        seoId: true,
        seo: {
          select: {
            id: true,
            metaTitle: true,
            metaDescription: true,
            seoScore: true,
            focusKeyword: true,
          },
        },
      },
    }),
    db.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        seoId: true,
        seo: {
          select: {
            id: true,
            metaTitle: true,
            metaDescription: true,
            seoScore: true,
            focusKeyword: true,
          },
        },
      },
    }),
  ]);

  const rows = [
    ...pages.map((p) => ({
      entityType: "page" as const,
      entityId: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      path: `/${p.slug}`,
      seoId: p.seoId,
      metaTitle: p.seo?.metaTitle ?? "",
      metaDescription: p.seo?.metaDescription ?? "",
      seoScore: p.seo?.seoScore ?? null,
      focusKeyword: p.seo?.focusKeyword ?? "",
    })),
    ...posts.map((p) => ({
      entityType: "post" as const,
      entityId: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      path: `/blog/${p.slug}`,
      seoId: p.seoId,
      metaTitle: p.seo?.metaTitle ?? "",
      metaDescription: p.seo?.metaDescription ?? "",
      seoScore: p.seo?.seoScore ?? null,
      focusKeyword: p.seo?.focusKeyword ?? "",
    })),
  ];

  return NextResponse.json({ rows });
}

const patchSchema = z.object({
  entityType: z.enum(["page", "post"]),
  entityId: z.string().min(1),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.manage") && !can(user.role, "settings.update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { entityType, entityId, metaTitle, metaDescription } = parsed.data;

  if (entityType === "page") {
    const page = await db.page.findUnique({
      where: { id: entityId },
      select: { seoId: true, title: true, slug: true },
    });
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existingSeo = page.seoId
      ? await db.seoMetadata.findUnique({ where: { id: page.seoId } })
      : null;

    const seoId = await upsertSeoRecord(page.seoId, {
      metaTitle: metaTitle !== undefined ? metaTitle : existingSeo?.metaTitle,
      metaDescription:
        metaDescription !== undefined ? metaDescription : existingSeo?.metaDescription,
      canonicalUrl: existingSeo?.canonicalUrl,
      ogTitle: existingSeo?.ogTitle,
      ogDescription: existingSeo?.ogDescription,
      ogImage: existingSeo?.ogImage,
      robotsIndex: existingSeo?.robotsIndex,
      robotsFollow: existingSeo?.robotsFollow,
      structuredData: existingSeo?.structuredData,
      focusKeyword: existingSeo?.focusKeyword,
      secondaryKeywords: existingSeo?.secondaryKeywords,
      schemaType: existingSeo?.schemaType,
      breadcrumbLabel: existingSeo?.breadcrumbLabel,
      includeInSitemap: existingSeo?.includeInSitemap,
    }, { fallbackTitle: page.title });

    if (seoId && seoId !== page.seoId) {
      await db.page.update({ where: { id: entityId }, data: { seoId } });
    }

    revalidatePath(`/${page.slug}`);
    await audit({
      action: "update",
      entityType: "seo_bulk_page",
      entityId,
      userId: user.id,
    });
    return NextResponse.json({ ok: true, seoId });
  }

  const post = await db.blogPost.findUnique({
    where: { id: entityId },
    select: { seoId: true, title: true, slug: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingSeo = post.seoId
    ? await db.seoMetadata.findUnique({ where: { id: post.seoId } })
    : null;

  const seoId = await upsertSeoRecord(post.seoId, {
    metaTitle: metaTitle !== undefined ? metaTitle : existingSeo?.metaTitle,
    metaDescription:
      metaDescription !== undefined ? metaDescription : existingSeo?.metaDescription,
    canonicalUrl: existingSeo?.canonicalUrl,
    ogTitle: existingSeo?.ogTitle,
    ogDescription: existingSeo?.ogDescription,
    ogImage: existingSeo?.ogImage,
    robotsIndex: existingSeo?.robotsIndex,
    robotsFollow: existingSeo?.robotsFollow,
    structuredData: existingSeo?.structuredData,
    focusKeyword: existingSeo?.focusKeyword,
    secondaryKeywords: existingSeo?.secondaryKeywords,
    schemaType: existingSeo?.schemaType,
    breadcrumbLabel: existingSeo?.breadcrumbLabel,
    includeInSitemap: existingSeo?.includeInSitemap,
  }, { fallbackTitle: post.title });

  if (seoId && seoId !== post.seoId) {
    await db.blogPost.update({ where: { id: entityId }, data: { seoId } });
  }

  revalidatePath(`/blog/${post.slug}`);
  await audit({
    action: "update",
    entityType: "seo_bulk_post",
    entityId,
    userId: user.id,
  });
  return NextResponse.json({ ok: true, seoId });
}
