import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { ProjectCard } from "@/components/public/project-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { buildPageMetadata } from "@/lib/seo";
import { getListHero } from "@/lib/list-heroes";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getListHero("work");
  return buildPageMetadata(null, {
    title: hero.title,
    description: hero.subtitle,
    path: "/work",
  });
}

export default async function WorkPage() {
  const hero = await getListHero("work");
  const projects = await db.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <PublicShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        chapterIndex="01"
        chapterLabel="WORK"
      />

      <StoryChapter id="chapter-index" index="02" label="INDEX" className="border-b border-border">
        <div className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="mb-10 max-w-xl text-muted-foreground">
              Selected projects — each one a shipped system, not a mood board.
            </p>
            {projects.length === 0 ? (
              <div className="border border-dashed border-border bg-background p-12 text-center">
                <p className="font-display text-xl font-medium">Case studies coming soon.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We don&apos;t publish work we can&apos;t talk about with real numbers. When
                  something ships and the data is public, it&apos;ll be here.
                </p>
              </div>
            ) : (
              <StaggerGrid className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
                {projects.map((p) => (
                  <StaggerItem key={p.id}>
                    <div className="h-full bg-background transition-colors hover:bg-secondary/40">
                      <ProjectCard project={p} />
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
        heading="Have a similar brief?"
        subheading="Send the constraint that matters most. We'll respond with a six-week plan."
      />
    </PublicShell>
  );
}
