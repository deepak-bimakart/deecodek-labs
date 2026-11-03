import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");

  const [pages, services, products, projects, posts] = await Promise.all([
    db.page.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        isHomepage: true,
        seo: { select: { robotsIndex: true, includeInSitemap: true } },
      },
    }),
    db.service.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        seo: { select: { robotsIndex: true, includeInSitemap: true } },
      },
    }),
    db.product.findMany({
      where: { status: { not: "archived" } },
      select: {
        slug: true,
        updatedAt: true,
        seo: { select: { robotsIndex: true, includeInSitemap: true } },
      },
    }),
    db.project.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        seo: { select: { robotsIndex: true, includeInSitemap: true } },
      },
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        seo: { select: { robotsIndex: true, includeInSitemap: true } },
      },
    }),
  ]);

  const indexable = <
    T extends { seo: { robotsIndex: boolean; includeInSitemap: boolean } | null },
  >(
    row: T
  ) => row.seo?.robotsIndex !== false && row.seo?.includeInSitemap !== false;

  const home = pages.find((p) => p.isHomepage || p.slug === "home");
  const about = pages.find((p) => p.slug === "about");
  const contact = pages.find((p) => p.slug === "contact");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: home?.updatedAt },
    { url: `${base}/services` },
    { url: `${base}/products` },
    { url: `${base}/work` },
    {
      url: `${base}/about`,
      lastModified: about?.updatedAt,
    },
    { url: `${base}/blog` },
    {
      url: `${base}/contact`,
      lastModified: contact?.updatedAt,
    },
    { url: `${base}/opensource` },
  ];

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter(indexable)
    .filter((p) => !p.isHomepage && !["home", "about", "contact"].includes(p.slug))
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt,
    }));

  return [
    ...staticRoutes,
    ...pageEntries,
    ...services.filter(indexable).map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updatedAt,
    })),
    ...products.filter(indexable).map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
    })),
    ...projects.filter(indexable).map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: p.updatedAt,
    })),
    ...posts.filter(indexable).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? p.updatedAt,
    })),
  ];
}
