import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { BlogCard } from "@/components/public/blog-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { buildPageMetadata } from "@/lib/seo";
import { getListHero } from "@/lib/list-heroes";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getListHero("blog");
  return buildPageMetadata(null, {
    title: hero.title,
    description: hero.subtitle,
    path: "/blog",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const hero = await getListHero("blog");

  const [categories, posts] = await Promise.all([
    db.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: { where: { status: "PUBLISHED" } } },
        },
      },
    }),
    db.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      include: { category: true, author: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return (
    <PublicShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        chapterIndex="01"
        chapterLabel="FIELD NOTES"
      />

      <StoryChapter id="chapter-feed" index="02" label="FEED" className="border-b border-border">
        <div className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-8">
              <Link
                href="/blog"
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                  !categorySlug
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/blog?category=${c.slug}`}
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                    categorySlug === c.slug
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.name}
                  <span className="ml-1 opacity-50">({c._count.posts})</span>
                </Link>
              ))}
            </div>

            {posts.length === 0 ? (
              <div className="border border-dashed border-border bg-background p-12 text-center">
                <p className="font-display text-xl font-medium">No posts yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;re busy shipping. Writing will land here when there&apos;s something
                  worth your time.
                </p>
              </div>
            ) : (
              <StaggerGrid
                className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
                stagger={0.08}
              >
                {posts.map((p) => (
                  <StaggerItem key={p.id}>
                    <div className="h-full bg-background transition-colors hover:bg-secondary/40">
                      <BlogCard post={p} />
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
        heading="Prefer a conversation to a post?"
        subheading="Write us about the problem you're solving. We'll reply with substance."
      />
    </PublicShell>
  );
}
