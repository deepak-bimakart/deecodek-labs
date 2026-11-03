import Link from "next/link";
import { db } from "@/lib/db";
import { SeoBulkManager, type BulkSeoRow } from "@/components/admin/seo-bulk-manager";

export const dynamic = "force-dynamic";

export default async function AdminSeoBulkPage() {
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
            metaTitle: true,
            metaDescription: true,
            seoScore: true,
            focusKeyword: true,
          },
        },
      },
    }),
  ]);

  const rows: BulkSeoRow[] = [
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Bulk SEO</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inline-edit meta title and description for pages and blog posts.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/seo" className="text-primary hover:underline">
            SEO overview
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/admin/seo/404s" className="text-primary hover:underline">
            404 monitor
          </Link>
        </div>
      </div>
      <SeoBulkManager initialRows={rows} />
    </div>
  );
}
