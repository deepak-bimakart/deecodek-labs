import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { buildPageMetadata } from "@/lib/seo";
import { getListHero } from "@/lib/list-heroes";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getListHero("services");
  return buildPageMetadata(null, {
    title: hero.title,
    description: hero.subtitle,
    path: "/services",
  });
}

export default async function ServicesPage() {
  const hero = await getListHero("services");
  const services = await db.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <PublicShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        chapterIndex="01"
        chapterLabel="SERVICES"
      />

      <StoryChapter id="chapter-menu" index="02" label="MENU" className="border-b border-border">
        <div className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="mb-10 max-w-xl text-muted-foreground">
              Six lanes of work — each mapped to codebases we&apos;ve already shipped.
            </p>
            <StaggerGrid
              className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.08}
            >
              {services.map((s) => (
                <StaggerItem key={s.id}>
                  <div className="h-full bg-background transition-colors hover:bg-secondary/40">
                    <ServiceCard service={s} />
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </div>
      </StoryChapter>

      <StoryCloseCta
        index="03"
        label="CLOSE"
        heading="Pick a lane. Or bring a hybrid."
        subheading="Most briefs cut across two categories. Tell us yours."
      />
    </PublicShell>
  );
}
