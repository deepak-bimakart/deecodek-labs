import { db } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { resolveSocialLinks } from "@/lib/social-links";
import { resolveSchemaType } from "@/lib/json-ld-shared";

export {
  defaultSchemaType,
  parseCustomStructuredData,
  resolveSchemaType,
  stringifyJsonLd,
  type SeoEntityKind,
} from "@/lib/json-ld-shared";

export const ORG_ID = () => `${siteBase()}/#organization`;
export const WEBSITE_ID = () => `${siteBase()}/#website`;

function siteBase() {
  return SITE_URL.replace(/\/$/, "");
}

function absoluteUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = siteBase();
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

async function loadOrgSettings(): Promise<{
  email: string;
  description: string;
  sameAs: string[];
}> {
  const keys = [
    "seo.org.email",
    "seo.org.description",
    "brand.email",
    "social.links",
    "social.github",
    "social.linkedin",
    "social.twitter",
  ];
  let map: Record<string, unknown> = {};
  try {
    const rows = await db.siteSetting.findMany({ where: { key: { in: keys } } });
    for (const r of rows) {
      try {
        map[r.key] = JSON.parse(r.value);
      } catch {
        map[r.key] = r.value;
      }
    }
  } catch {
    map = {};
  }

  const email =
    (typeof map["seo.org.email"] === "string" && map["seo.org.email"].trim()) ||
    (typeof map["brand.email"] === "string" && map["brand.email"].trim()) ||
    "hello@deecodeklabs.com";

  const description =
    (typeof map["seo.org.description"] === "string" &&
      map["seo.org.description"].trim()) ||
    "Software studio and product lab — custom products, scalable backends, and useful tools.";

  const links = resolveSocialLinks(map as Record<string, unknown>);
  const sameAs = links.map((l) => l.url).filter(Boolean);
  if (sameAs.length === 0) {
    sameAs.push(
      "https://github.com/deecodeklabs",
      "https://opensource.deecodeklabs.com"
    );
  }

  return { email, description, sameAs };
}

/** Site-wide Organization (+ ProfessionalService) + WebSite graph nodes. */
export async function buildSiteJsonLdGraph(): Promise<Record<string, unknown>[]> {
  const base = siteBase();
  const { email, description, sameAs } = await loadOrgSettings();

  const organization: Record<string, unknown> = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID(),
    name: SITE_NAME,
    alternateName: ["DeeCodeK", "deecodeklabs"],
    url: base,
    logo: {
      "@type": "ImageObject",
      url: `${base}/logo-light.png`,
    },
    description,
    sameAs,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    email,
  };

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    url: base,
    name: SITE_NAME,
    alternateName: ["DeeCodeK", "deecodeklabs"],
    publisher: { "@id": ORG_ID() },
    inLanguage: "en",
  };

  return [organization, website];
}

export type BlogPostingInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  authorName?: string | null;
  schemaType?: string | null;
};

export function buildBlogPostingJsonLd(post: BlogPostingInput): Record<string, unknown> {
  const url = `${siteBase()}/blog/${post.slug}`;
  const image = absoluteUrl(post.coverImage);
  const datePublished = post.publishedAt
    ? new Date(post.publishedAt).toISOString()
    : undefined;
  const dateModified = post.updatedAt
    ? new Date(post.updatedAt).toISOString()
    : datePublished;

  return {
    "@context": "https://schema.org",
    "@type": resolveSchemaType(post.schemaType, "blog"),
    headline: post.title,
    description: post.excerpt || undefined,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(image ? { image: [image] } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: {
      "@type": "Person",
      name: post.authorName?.trim() || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID(),
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${siteBase()}/logo-light.png`,
      },
    },
  };
}

export type ServiceJsonLdInput = {
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  schemaType?: string | null;
};

export function buildServiceJsonLd(service: ServiceJsonLdInput): Record<string, unknown> {
  const url = `${siteBase()}/services/${service.slug}`;
  const image = absoluteUrl(service.imageUrl);
  return {
    "@context": "https://schema.org",
    "@type": resolveSchemaType(service.schemaType, "service"),
    name: service.title,
    description: service.summary || service.description || undefined,
    url,
    provider: { "@id": ORG_ID() },
    ...(image ? { image } : {}),
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

export type SoftwareApplicationInput = {
  name: string;
  slug: string;
  tagline?: string | null;
  summary?: string | null;
  description?: string | null;
  coverImage?: string | null;
  category?: string | null;
  externalUrl?: string | null;
  /** Product status string — maps to operating status hints only, never ratings. */
  status?: string | null;
  schemaType?: string | null;
};

export function buildSoftwareApplicationJsonLd(
  product: SoftwareApplicationInput
): Record<string, unknown> {
  const url = `${siteBase()}/products/${product.slug}`;
  const image = absoluteUrl(product.coverImage);
  const description =
    product.tagline || product.summary || product.description || undefined;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": resolveSchemaType(product.schemaType, "product"),
    name: product.name,
    description,
    url,
    applicationCategory: product.category || "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      url: product.externalUrl || url,
      availability:
        product.status === "launched"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
    },
    provider: { "@id": ORG_ID() },
    author: { "@id": ORG_ID() },
  };
  if (image) data.image = image;
  // Intentionally omit aggregateRating / review — no fake ratings.
  return data;
}

export type FaqItem = { question: string; answer: string };

export function buildFaqPageJsonLd(items: FaqItem[]): Record<string, unknown> | null {
  const valid = items.filter(
    (i) => i.question?.trim() && i.answer?.trim()
  );
  if (valid.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((i) => ({
      "@type": "Question",
      name: i.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: i.answer.trim(),
      },
    })),
  };
}
