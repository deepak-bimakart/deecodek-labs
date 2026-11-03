import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { ProductCard } from "@/components/public/product-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { getListHero } from "@/lib/list-heroes";
import { buildListPageMetadata } from "@/lib/list-page-seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildListPageMetadata("products");
}

export default async function ProductsPage() {
  const hero = await getListHero("products");
  const products = await db.product.findMany({
    where: { status: { not: "archived" } },
    orderBy: { sortOrder: "asc" },
    include: { features: true },
  });

  return (
    <PublicShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        chapterIndex="01"
        chapterLabel="LAB"
      />

      <StoryChapter id="chapter-catalog" index="02" label="CATALOG" className="border-b border-border">
        <div className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="mb-10 max-w-xl text-muted-foreground">
              Built in-house first. Then opened to the world when the loop holds.
            </p>
            {products.length === 0 ? (
              <div className="border border-dashed border-border bg-background p-12 text-center">
                <p className="font-display text-xl font-medium">Products coming soon.</p>
              </div>
            ) : (
              <StaggerGrid className="grid gap-px border border-border bg-border md:grid-cols-2" stagger={0.12}>
                {products.map((p) => (
                  <StaggerItem key={p.id} y={24}>
                    <div className="h-full bg-background transition-colors hover:bg-secondary/40">
                      <ProductCard product={p} />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}
          </div>
        </div>
      </StoryChapter>

      <StoryCloseCta
        index="03"
        label="CLOSE"
        heading="Need something adjacent?"
        subheading="We spin up sister products on the same cadence we ship for ourselves."
      />
    </PublicShell>
  );
}
