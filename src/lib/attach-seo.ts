import { db } from "@/lib/db";
import type { seoFieldsSchema } from "@/lib/seo";
import type { z } from "zod";

export type SeoInput = z.infer<typeof seoFieldsSchema>;

/** Create or update SeoMetadata and return its id. */
export async function upsertSeoRecord(
  existingSeoId: string | null | undefined,
  seo: SeoInput | null | undefined
): Promise<string | null | undefined> {
  if (seo === undefined) return undefined; // no change
  if (seo === null) return null;

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
  };

  if (existingSeoId) {
    await db.seoMetadata.update({ where: { id: existingSeoId }, data });
    return existingSeoId;
  }

  const created = await db.seoMetadata.create({ data });
  return created.id;
}
