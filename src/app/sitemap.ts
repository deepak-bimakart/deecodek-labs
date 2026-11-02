import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");

  const [pages, services, products, projects, posts] = await Promise.all([
    db.page.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, isHomepage: true },
    }),
    db.service.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.product.findMany({
      where: { status: { not: "archived" } },
      select: { slug: true, updatedAt: true },
    }),
    db.project.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/services",
    "/products",
    "/work",
    "/about",
    "/blog",
    "/contact",
    "/opensource",
  ].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((p) => !p.isHomepage && !["home", "about", "contact"].includes(p.slug))
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Ensure homepage lastmod from CMS when available
  const home = pages.find((p) => p.isHomepage || p.slug === "home");
  if (home) {
    const idx = staticRoutes.findIndex((r) => r.url === base || r.url === `${base}/`);
    if (idx >= 0) {
      staticRoutes[idx] = {
        ...staticRoutes[idx],
        url: base,
        lastModified: home.updatedAt,
        priority: 1,
      };
    }
  }

  return [
    ...staticRoutes,
    ...pageEntries,
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
