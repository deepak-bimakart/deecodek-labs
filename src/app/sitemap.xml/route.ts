import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";

/**
 * Legacy XML route — Next.js also serves MetadataRoute via `src/app/sitemap.ts`.
 * Keep this as a thin redirect so old `/sitemap.xml` consumers still work if
 * both conflict; prefer the generated sitemap from sitemap.ts when available.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const base = SITE_URL.replace(/\/$/, "");
  // Point clients at the App Router sitemap entry (same path). When both exist,
  // this handler wins for /sitemap.xml — rebuild XML using the shared module logic.
  const { default: buildSitemap } = await import("../sitemap");
  const entries = await buildSitemap();

  const urls = entries
    .map((e) => {
      const lastmod = e.lastModified
        ? `<lastmod>${new Date(e.lastModified).toISOString()}</lastmod>`
        : "";
      const priority =
        typeof e.priority === "number" ? `<priority>${e.priority}</priority>` : "";
      const changefreq = e.changeFrequency
        ? `<changefreq>${e.changeFrequency}</changefreq>`
        : "";
      return `  <url><loc>${e.url}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "X-Sitemap-Base": base,
    },
  });
}
