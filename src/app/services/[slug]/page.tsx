import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { PreviewBadge } from "@/components/public/preview-badge";
import { Reveal } from "@/components/motion/motion";
import { StoryChapter } from "@/components/story/story-chapter";
import { StoryCloseCta } from "@/components/story/story-close-cta";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { CustomJsonLd, JsonLd } from "@/components/seo-json-ld";
import { buildServiceJsonLd } from "@/lib/json-ld";
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
  const service = await db.service.findUnique({ where: { slug }, include: { seo: true } });
  const access = await resolveContentAccess({
    isPublished: !!service && service.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!service || !access.allow) return { title: "Services" };
  return buildPageMetadata(service.seo, {
    title: service.title,
    description: service.summary || undefined,
    path: `/services/${slug}`,
    image: undefined,
  });
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const service = await db.service.findUnique({
    where: { slug },
    include: { seo: true },
  });

  const access = await resolveContentAccess({
    isPublished: !!service && service.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!service || !access.allow) notFound();

  let technologies: string[] = [];
  let capabilities: string[] = [];
  try {
    technologies = JSON.parse(service.technologies ?? "[]");
    capabilities = JSON.parse(service.capabilities ?? "[]");
  } catch {}

  const serviceJsonLd = buildServiceJsonLd({
    title: service.title,
    slug: service.slug,
    summary: service.summary,
    description: service.description,
    imageUrl: service.imageUrl,
    schemaType: service.seo?.schemaType,
  });

  return (
    <PublicShell>
      {access.isPreview ? <PreviewBadge /> : null}
      <JsonLd data={serviceJsonLd} />
      <CustomJsonLd raw={service.seo?.structuredData} />
      <article>
        <PageHero
          eyebrow={service.icon ?? "Service"}
          title={service.title}
          subtitle={service.summary ?? undefined}
          chapterIndex="01"
          chapterLabel="SERVICE"
        >
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.title },
            ]}
          />
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-3 w-3 rotate-180" /> All services
          </Link>
        </PageHero>

        <StoryChapter id="chapter-shape" index="02" label="SHAPE" className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-4 lg:grid-cols-[2fr_1fr] lg:px-10 lg:pb-20">
            <div className="space-y-6">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">What this looks like</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </Reveal>

              {capabilities.length > 0 && (
                <Reveal delay={0.2}>
                  <>
                    <h3 className="mt-10 font-display text-xl font-semibold">Capabilities</h3>
                    <ul className="mt-4 space-y-3">
                      {capabilities.map((c, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                </Reveal>
              )}
            </div>

            <Reveal delay={0.15}>
              <aside className="space-y-6 border border-border bg-secondary/30 p-6">
                <div>
                  <p className="mono-label mb-3">Tech stack</p>
                  <ul className="space-y-1.5">
                    {technologies.map((t, i) => (
                      <li key={i} className="font-mono text-sm">{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-border pt-6">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    Build with us{" "}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </aside>
            </Reveal>
          </div>
        </StoryChapter>

        <StoryCloseCta
          index="03"
          label="CLOSE"
          heading="This the lane you need?"
          subheading="Tell us the constraint. We'll map the first six weeks."
        />
      </article>
    </PublicShell>
  );
}
