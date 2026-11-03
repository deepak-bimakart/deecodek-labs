import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { BlogCard } from "@/components/public/blog-card";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { getAboutFounder } from "@/lib/about-founder";
import { SITE_NAME } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const author = await db.user.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!author) return { title: "Author" };
  const name = author.name?.trim() || "Author";
  return {
    title: `${name} · Authors`,
    description: `Posts by ${name} at ${SITE_NAME}.`,
  };
}

export default async function BlogAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [author, founder] = await Promise.all([
    db.user.findUnique({
      where: { id },
      select: { id: true, name: true, image: true, isActive: true },
    }),
    getAboutFounder(),
  ]);

  if (!author || !author.isActive) notFound();

  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED", authorId: author.id },
    orderBy: { publishedAt: "desc" },
    include: { category: true, author: true },
  });

  const name = author.name?.trim() || "Author";
  const isFounder =
    name.toLowerCase() === founder.name.toLowerCase() ||
    name.toLowerCase().includes("deepak");
  const bio = isFounder
    ? founder.bio
    : `Writer and engineer at ${SITE_NAME}. Posts below are published under this author profile.`;
  const photo = author.image || (isFounder ? founder.photo : null);

  return (
    <PublicShell>
      <PageHero
        eyebrow="Authors"
        title={name}
        subtitle={bio}
        chapterIndex="01"
        chapterLabel="AUTHOR"
      >
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: name },
          ]}
        />
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          All posts
        </Link>
      </PageHero>

      <section className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-start lg:px-10">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={name}
              className="h-28 w-28 shrink-0 border border-border object-cover"
            />
          ) : (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center border border-border bg-secondary/40 font-display text-3xl font-semibold text-primary"
              aria-hidden
            >
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-semibold">{name}</h2>
            <p className="mt-2 text-pretty text-muted-foreground">{bio}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {posts.length} published {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No published posts yet.</p>
          ) : (
            <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div key={post.id} className="bg-background">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
