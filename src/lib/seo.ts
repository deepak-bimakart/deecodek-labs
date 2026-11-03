import type { Metadata } from "next";
import type { SeoMetadata } from "@prisma/client";
import { z } from "zod";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://deecodeklabs.com";
export const SITE_NAME = "DeeCodeK Labs";

const zNullableString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v == null || v === "" ? null : v));

export const seoFieldsSchema = z.object({
  metaTitle: zNullableString,
  metaDescription: zNullableString,
  canonicalUrl: zNullableString,
  ogTitle: zNullableString,
  ogDescription: zNullableString,
  ogImage: zNullableString,
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  structuredData: zNullableString,
  focusKeyword: zNullableString,
  secondaryKeywords: zNullableString,
  schemaType: zNullableString,
  breadcrumbLabel: zNullableString,
  includeInSitemap: z.boolean().optional(),
  seoScore: z.number().int().min(0).max(100).optional().nullable(),
});

/** Nested SEO payload on entity create/update. */
export const nestedSeoSchema = seoFieldsSchema.optional().nullable();

export type SeoFallbacks = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
};

function absoluteUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export function buildPageMetadata(
  seo: Partial<SeoMetadata> | null | undefined,
  fallbacks: SeoFallbacks
): Metadata {
  const title = seo?.metaTitle || fallbacks.title;
  const description =
    seo?.metaDescription ||
    fallbacks.description ||
    "Software studio and product lab — custom products, scalable backends, useful tools.";
  const canonical =
    seo?.canonicalUrl ||
    (fallbacks.path
      ? `${SITE_URL.replace(/\/$/, "")}${fallbacks.path.startsWith("/") ? fallbacks.path : `/${fallbacks.path}`}`
      : undefined);
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage =
    absoluteUrl(seo?.ogImage) ||
    absoluteUrl(fallbacks.image) ||
    absoluteUrl("/logo-light.png");
  const index = seo?.robotsIndex ?? true;
  const follow = seo?.robotsFollow ?? true;

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: { index, follow },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical || SITE_URL,
      siteName: SITE_NAME,
      type: "website",
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
