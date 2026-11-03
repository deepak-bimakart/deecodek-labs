import { db } from "@/lib/db";
import { buildPageMetadata, type SeoFallbacks } from "@/lib/seo";
import { getListHero } from "@/lib/list-heroes";
import type { Metadata } from "next";

/** List routes (/services, /products, /work, /blog) — prefer CMS Page SEO by slug, else listHero. */
export async function buildListPageMetadata(
  slug: "services" | "products" | "work" | "blog"
): Promise<Metadata> {
  const page = await db.page.findUnique({
    where: { slug },
    include: { seo: true },
  });
  const hero = await getListHero(slug);
  const fallbacks: SeoFallbacks = {
    title: hero.title,
    description: hero.subtitle,
    path: `/${slug}`,
  };
  return buildPageMetadata(page?.seo, fallbacks);
}
