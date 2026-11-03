import { db } from "@/lib/db";

export type SeoHealthSummary = {
  missingMetaCount: number;
  notFoundHitCount: number;
  avgSeoScore: number | null;
  scoredRecords: number;
};

/** Weekly-style SEO health rollup for the admin dashboard. */
export async function getSeoHealthSummary(): Promise<SeoHealthSummary> {
  const empty: SeoHealthSummary = {
    missingMetaCount: 0,
    notFoundHitCount: 0,
    avgSeoScore: null,
    scoredRecords: 0,
  };

  try {
    const [pages, posts, services, products, projects, hits, scored] = await Promise.all([
      db.page.findMany({
        select: {
          seo: { select: { metaTitle: true, metaDescription: true } },
        },
      }),
      db.blogPost.findMany({
        select: {
          seo: { select: { metaTitle: true, metaDescription: true } },
        },
      }),
      db.service.findMany({
        select: {
          seo: { select: { metaTitle: true, metaDescription: true } },
        },
      }),
      db.product.findMany({
        select: {
          seo: { select: { metaTitle: true, metaDescription: true } },
        },
      }),
      db.project.findMany({
        select: {
          seo: { select: { metaTitle: true, metaDescription: true } },
        },
      }),
      db.notFoundHit.aggregate({ _sum: { count: true } }).catch(() => ({
        _sum: { count: null as number | null },
      })),
      db.seoMetadata.aggregate({
        _avg: { seoScore: true },
        _count: { seoScore: true },
      }),
    ]);

    const missingMeta = (rows: Array<{ seo: { metaTitle: string | null; metaDescription: string | null } | null }>) =>
      rows.filter((r) => {
        if (!r.seo) return true;
        const title = r.seo.metaTitle?.trim();
        const desc = r.seo.metaDescription?.trim();
        return !title || !desc;
      }).length;

    return {
      missingMetaCount:
        missingMeta(pages) +
        missingMeta(posts) +
        missingMeta(services) +
        missingMeta(products) +
        missingMeta(projects),
      notFoundHitCount: hits._sum.count ?? 0,
      avgSeoScore:
        scored._avg.seoScore != null ? Math.round(scored._avg.seoScore) : null,
      scoredRecords: scored._count.seoScore ?? 0,
    };
  } catch {
    return empty;
  }
}

export type GscEnvStatus = {
  configured: boolean;
  siteUrl: string | null;
  clientEmail: string | null;
  hasPrivateKey: boolean;
  propertyId: string | null;
};

/** Read GOOGLE_SEARCH_CONSOLE_* env without exposing secrets. */
export function getGscEnvStatus(): GscEnvStatus {
  const siteUrl =
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() ||
    process.env.GOOGLE_SEARCH_CONSOLE_SITE?.trim() ||
    null;
  const clientEmail =
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim() || null;
  const hasPrivateKey = Boolean(
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.trim() ||
      process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS?.trim()
  );
  const propertyId =
    process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY_ID?.trim() || null;

  return {
    configured: Boolean(siteUrl && (clientEmail || hasPrivateKey || propertyId)),
    siteUrl,
    clientEmail,
    hasPrivateKey,
    propertyId,
  };
}
