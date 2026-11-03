import { db } from "@/lib/db";
import type { seoFieldsSchema } from "@/lib/seo";
import { computeSeoScore } from "@/lib/seo-score";
import type { z } from "zod";

export type SeoInput = z.infer<typeof seoFieldsSchema>;

/** Create or update SeoMetadata and return its id. */
export async function upsertSeoRecord(
  existingSeoId: string | null | undefined,
  seo: SeoInput | null | undefined,
  opts?: { fallbackTitle?: string | null }
): Promise<string | null | undefined> {
  if (seo === undefined) return undefined;
  if (seo === null) return null;

  const scored = computeSeoScore({
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    focusKeyword: seo.focusKeyword,
    ogImage: seo.ogImage,
    canonicalUrl: seo.canonicalUrl,
    robotsIndex: seo.robotsIndex,
    includeInSitemap: seo.includeInSitemap,
    schemaType: seo.schemaType,
    structuredData: seo.structuredData,
    fallbackTitle: opts?.fallbackTitle,
  });

  const data = {
    metaTitle: seo.metaTitle ?? null,
    metaDescription: seo.metaDescription ?? null,
    canonicalUrl: seo.canonicalUrl ?? null,
    ogTitle: seo.ogTitle ?? null,
    ogDescription: seo.ogDescription ?? null,
    ogImage: seo.ogImage ?? null,
    robotsIndex: seo.robotsIndex ?? true,
    robotsFollow: seo.robotsFollow ?? true,
    schemaType: seo.schemaType ?? null,
    structuredData: seo.structuredData ?? null,
    focusKeyword: seo.focusKeyword ?? null,
    secondaryKeywords: seo.secondaryKeywords ?? null,
    schemaType: seo.schemaType ?? null,
    breadcrumbLabel: seo.breadcrumbLabel ?? null,
    includeInSitemap: seo.includeInSitemap ?? true,
    seoScore: seo.seoScore ?? scored.score,
  };

  if (existingSeoId) {
    await db.seoMetadata.update({ where: { id: existingSeoId }, data });
    return existingSeoId;
  }

  const created = await db.seoMetadata.create({ data });
  return created.id;
}
