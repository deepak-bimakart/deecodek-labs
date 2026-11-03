import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { BlogCard } from "@/components/public/blog-card";
import { PreviewBadge } from "@/components/public/preview-badge";
import { Reveal } from "@/components/motion/motion";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { CustomJsonLd, JsonLd } from "@/components/seo-json-ld";
import ReactMarkdown from "react-markdown";
import { buildBlogPostingJsonLd } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { resolveContentAccess } from "@/lib/preview";
import { relatedServicesForPost } from "@/lib/related-content";
import { ArrowUpRight } from "lucide-react";

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
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { seo: true },
  });
  const access = await resolveContentAccess({
    isPublished: !!post && post.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!post || !access.allow) return { title: "Blog" };
  return buildPageMetadata(post.seo, {
    title: post.title,
    description: post.excerpt || undefined,
    path: `/blog/${slug}`,
    image: post.coverImage,
  });
}

export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      seo: true,
    },
  });

  const access = await resolveContentAccess({
    isPublished: !!post && post.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!post || !access.allow) notFound();

  const [related, relatedServices] = await Promise.all([
    post.categoryId
      ? db.blogPost.findMany({
          where: {
            status: "PUBLISHED",
            categoryId: post.categoryId,
            id: { not: post.id },
          },
          take: 3,
          orderBy: { publishedAt: "desc" },
          include: { category: true, author: true },
        })
      : Promise.resolve([]),
    relatedServicesForPost({
      title: post.title,
      excerpt: post.excerpt,
      categoryName: post.category?.name,
      tagNames: post.tags.map((t) => t.tag.name),
      take: 3,
    }),
  ]);

  const blogJsonLd = buildBlogPostingJsonLd({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.author?.name,
    schemaType: post.seo?.schemaType,
  });

  return (
    <PublicShell>
      {access.isPreview ? <PreviewBadge /> : null}
      <JsonLd data={blogJsonLd} />
      <CustomJsonLd raw={post.seo?.structuredData} />
      <article>
        <PageHero
          eyebrow={post.category?.name ?? "Blog"}
          title={post.title}
          subtitle={post.excerpt ?? undefined}
          chapterIndex="01"
          chapterLabel="ESSAY"
        >
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            All posts
          </Link>
        </PageHero>

        <StoryChapter id="chapter-meta" index="02" label="META" className="border-b border-border bg-background">
          <div className="mx-auto max-w-3xl px-6 py-6 lg:px-10">
            <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {post.author?.name && <span>By {post.author.name}</span>}
              <span aria-hidden>·</span>
              <span>{post.readingMinutes} min read</span>
              {post.publishedAt && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </StoryChapter>

        {post.coverImage && (
          <StoryChapter id="chapter-frame" index="03" label="FRAME" className="border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-[40vh] w-full object-cover lg:h-[50vh]"
            />
          </StoryChapter>
        )}

        {post.content && (
          <StoryChapter id="chapter-body" index="04" label="BODY" className="border-b border-border bg-background">
            <Reveal>
              <div className="prose prose-lg mx-auto max-w-3xl px-6 pb-16 pt-4 lg:px-10 lg:pb-20">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h2 className="font-display text-3xl font-semibold mt-10 mb-4">{children}</h2>,
                    h2: ({ children }) => <h2 className="font-display text-2xl font-semibold mt-8 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="font-display text-xl font-semibold mt-6 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-pretty text-lg leading-relaxed text-muted-foreground mb-4">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4 text-muted-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-muted-foreground">{children}</ol>,
                    li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-primary pl-4 italic my-6 font-display text-xl">{children}</blockquote>
                    ),
                    code: ({ children }) => <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{children}</code>,
                    a: ({ href, children }) => (
                      <a href={href} className="text-primary underline underline-offset-4">{children}</a>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </Reveal>
          </StoryChapter>
        )}

        {post.tags.length > 0 && (
          <StoryChapter id="chapter-tags" index="05" label="TAGS" className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t.tagId}
                    className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            </div>
          </StoryChapter>
        )}

        {relatedServices.length > 0 && (
          <StoryChapter
            id="chapter-services"
            index="06"
            label="SERVICES"
            className="border-b border-border bg-secondary/30"
          >
            <div className="mx-auto max-w-3xl px-6 pb-16 pt-4 lg:px-10">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">Related services</h2>
                <p className="mt-2 text-muted-foreground">
                  If this topic is on your roadmap, here is how we ship it in production.
                </p>
              </Reveal>
              <ul className="mt-8 space-y-4">
                {relatedServices.map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.06}>
                    <li className="border-b border-border pb-4 last:border-0">
                      <Link
                        href={`/services/${s.slug}`}
                        className="group inline-flex items-center gap-1.5 font-display text-lg font-semibold hover:text-primary"
                      >
                        {s.title}
                        <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                      {s.summary && (
                        <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
                      )}
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </StoryChapter>
        )}

        <StoryCloseCta
          index="07"
          label="CLOSE"
          heading="Want to build with us?"
          subheading="Start a conversation about the problem you're solving."
        />

        {related.length > 0 && (
          <StoryChapter id="chapter-related" index="08" label="RELATED" className="border-b border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 pb-16 pt-4 lg:px-10">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">Continue reading</h2>
              </Reveal>
              <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-3">
                {related.map((p) => (
                  <div key={p.id} className="bg-background">
                    <BlogCard post={p} />
                  </div>
                ))}
              </div>
            </div>
          </StoryChapter>
        )}
      </article>
    </PublicShell>
  );
}
