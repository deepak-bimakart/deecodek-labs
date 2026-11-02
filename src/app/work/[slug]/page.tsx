import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { PreviewBadge } from "@/components/public/preview-badge";
import { Reveal } from "@/components/motion/motion";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { buildPageMetadata } from "@/lib/seo";
import { resolveContentAccess } from "@/lib/preview";

export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const project = await db.project.findUnique({ where: { slug }, include: { seo: true } });
  const access = await resolveContentAccess({
    isPublished: !!project && project.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!project || !access.allow) return { title: "Work" };
  return buildPageMetadata(project.seo, {
    title: project.name,
    description: project.summary || undefined,
    path: `/work/${slug}`,
    image: project.coverImage,
  });
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const project = await db.project.findUnique({ where: { slug } });
  const access = await resolveContentAccess({
    isPublished: !!project && project.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!project || !access.allow) notFound();

  let technologies: string[] = [];
  let gallery: string[] = [];
  try {
    technologies = JSON.parse(project.technologies ?? "[]");
    gallery = JSON.parse(project.gallery ?? "[]");
  } catch {}

  return (
    <PublicShell>
      {access.isPreview ? <PreviewBadge /> : null}
      <article>
        <PageHero
          eyebrow={project.category ?? "Project"}
          title={project.name}
          subtitle={project.summary ?? undefined}
          chapterIndex="01"
          chapterLabel="CASE"
        >
          <Link
            href="/work"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-3 w-3 rotate-180" /> All work
          </Link>
        </PageHero>

        {project.coverImage && (
          <StoryChapter id="chapter-frame" index="02" label="FRAME" className="border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImage}
              alt={project.name}
              className="h-[50vh] w-full object-cover"
            />
          </StoryChapter>
        )}

        {project.caseStudy && (
          <StoryChapter id="chapter-narrative" index="03" label="NARRATIVE" className="border-b border-border bg-background">
            <div className="mx-auto max-w-3xl px-6 pb-16 pt-4 lg:px-10 lg:pb-20">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">The story</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-6 whitespace-pre-line text-pretty text-lg leading-relaxed text-muted-foreground">
                  {project.caseStudy}
                </div>
              </Reveal>
            </div>
          </StoryChapter>
        )}

        {technologies.length > 0 && (
          <StoryChapter id="chapter-stack" index="04" label="STACK" className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-4xl px-6 pb-16 pt-4 lg:px-10 lg:pb-20">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">Tech used</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {technologies.map((t, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </StoryChapter>
        )}

        {gallery.length > 0 && (
          <StoryChapter id="chapter-gallery" index="05" label="GALLERY" className="border-b border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 pb-16 pt-4 lg:px-10 lg:pb-20">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">Gallery</h2>
              </Reveal>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {gallery.map((src, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${project.name} gallery ${i + 1}`}
                      className="aspect-[4/3] w-full border border-border object-cover"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </StoryChapter>
        )}

        <StoryCloseCta
          index="06"
          label="CLOSE"
          heading="Want a case study like this?"
          subheading="Bring the constraint. We'll bring the six-week plan."
        />
      </article>
    </PublicShell>
  );
}
