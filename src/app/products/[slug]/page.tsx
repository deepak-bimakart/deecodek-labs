import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { PreviewBadge } from "@/components/public/preview-badge";
import { Reveal } from "@/components/motion/motion";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { CustomJsonLd, JsonLd } from "@/components/seo-json-ld";
import { buildSoftwareApplicationJsonLd } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { resolveContentAccess } from "@/lib/preview";

export const revalidate = 60;

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  coming_soon: { label: "Coming Soon", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  in_development: { label: "In Development", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  launched: { label: "Live", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  archived: { label: "Archived", tone: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
};

const FALLBACK_IMAGES: Record<string, string> = {
  marketflow: "/images/products/marketflow-dashboard.png",
  sadika: "/images/products/sadika-app.png",
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await db.product.findUnique({
    where: { slug },
    include: { seo: true },
  });
  const access = await resolveContentAccess({
    isPublished: !!product && product.status !== "archived",
    searchParams: sp,
  });
  if (!product || !access.allow) return { title: "Product" };
  return buildPageMetadata(product.seo, {
    title: product.name,
    description: product.tagline || product.summary || undefined,
    path: `/products/${slug}`,
    image: product.coverImage || FALLBACK_IMAGES[slug],
  });
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await db.product.findUnique({
    where: { slug },
    include: { features: { orderBy: { sortOrder: "asc" } }, seo: true },
  });

  const access = await resolveContentAccess({
    isPublished: !!product && product.status !== "archived",
    searchParams: sp,
  });
  if (!product || !access.allow) notFound();

  let technologies: string[] = [];
  let gallery: string[] = [];
  try {
    technologies = JSON.parse(product.technologies ?? "[]");
    gallery = JSON.parse(product.gallery ?? "[]");
  } catch {}

  const status = STATUS_LABELS[product.status] ?? STATUS_LABELS.in_development;
  const heroImage = product.coverImage || FALLBACK_IMAGES[product.slug] || gallery[0];

  const productJsonLd = buildSoftwareApplicationJsonLd({
    name: product.name,
    slug: product.slug,
    tagline: product.tagline,
    summary: product.summary,
    description: product.description,
    coverImage: heroImage,
    category: product.category,
    externalUrl: product.externalUrl,
    status: product.status,
    schemaType: product.seo?.schemaType,
  });

  return (
    <PublicShell>
      {access.isPreview ? <PreviewBadge /> : null}
      <JsonLd data={productJsonLd} />
      <CustomJsonLd raw={product.seo?.structuredData} />
      <article>
        <PageHero
          eyebrow={product.category ?? "Product"}
          title={product.name}
          subtitle={product.tagline ?? undefined}
          chapterIndex="01"
          chapterLabel="PRODUCT"
        >
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: product.name },
            ]}
          />
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-3 w-3 rotate-180" /> All products
          </Link>
        </PageHero>

        {heroImage && (
          <StoryChapter id="chapter-frame" index="02" label="FRAME" className="border-b border-border bg-background">
            <div className="mx-auto max-w-5xl px-6 pb-12 pt-4 lg:px-10">
              <Reveal>
                <div className="overflow-hidden border border-border">
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImage}
                      alt={`${product.name} — product screenshot`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </Reveal>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {status.label}
                </span>
              </div>
            </div>
          </StoryChapter>
        )}

        <StoryChapter id="chapter-overview" index="03" label="OVERVIEW" className="border-b border-border bg-background">
          <div className="mx-auto max-w-4xl px-6 pb-16 pt-4 lg:px-10 lg:pb-20">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold">What it is</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </Reveal>
          </div>
        </StoryChapter>

        {product.features.length > 0 && (
          <StoryChapter id="chapter-features" index="04" label="CAPABILITIES" className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-5xl px-6 pb-16 pt-4 lg:px-10 lg:pb-20">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">What it does</h2>
              </Reveal>
              <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
                {product.features.map((f, i) => (
                  <Reveal key={f.id} delay={i * 0.06}>
                    <div className="flex h-full items-start gap-3 bg-background p-5">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-soft text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <h3 className="font-display font-semibold">{f.title}</h3>
                        {f.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </StoryChapter>
        )}

        {technologies.length > 0 && (
          <StoryChapter id="chapter-stack" index="05" label="STACK" className="border-b border-border bg-background">
            <div className="mx-auto max-w-4xl px-6 pb-16 pt-4 lg:px-10 lg:pb-20">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">Built with</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {technologies.map((t, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-border bg-secondary/30 px-3 py-1.5 font-mono text-xs"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </StoryChapter>
        )}

        <StoryCloseCta
          index="06"
          label="CLOSE"
          heading="Want something like this?"
          subheading="We can spin up a similar product — or your own take — in six weeks, not six months."
        />
      </article>
    </PublicShell>
  );
}
