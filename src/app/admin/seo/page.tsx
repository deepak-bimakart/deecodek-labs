import { db } from "@/lib/db";
import { SeoManager } from "@/components/admin/seo-manager";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
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

  const redirects = await db.redirect.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">SEO Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage meta tags, OpenGraph, robots, and redirects across all content.
        </p>
      </div>
      <SeoManager initialRecords={seoRecords} initialRedirects={redirects} />
    </div>
  );
}
