import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import type { PageSection, Product, ProductFeature, Service, Project, BlogPost, BlogCategory, User } from "@prisma/client";
<<<<<<< HEAD
import { JsonLd } from "@/components/seo-json-ld";
import { buildFaqPageJsonLd } from "@/lib/json-ld";
=======
// Hero stays eagerly loaded - above-fold LCP path
>>>>>>> origin/seo/phase-3-cwv
import {
  HeroSection as HeroClient,
} from "@/components/sections/hero-section";
// Below-fold homepage sections - separate client chunks
const CapabilitiesClient = dynamic(() =>
  import("@/components/sections/capabilities-section").then((m) => m.CapabilitiesSection)
);
const ProductShowcaseClient = dynamic(() =>
  import("@/components/sections/product-showcase-section").then((m) => m.ProductShowcaseSection)
);
const ProcessTimelineClient = dynamic(() =>
  import("@/components/sections/process-timeline-section").then((m) => m.ProcessTimelineSection)
);
const TechStackClient = dynamic(() =>
  import("@/components/sections/tech-stack-section").then((m) => m.TechStackSection)
);
const EditorialTextClient = dynamic(() =>
  import("@/components/sections/editorial-text-section").then((m) => m.EditorialTextSection)
);
const CTAClient = dynamic(() =>
  import("@/components/sections/cta-section").then((m) => m.CTASection)
);
import {
  ServicesListContent,
  ProductShowcaseContent,
  PortfolioGridContent,
  FAQContent,
  ContactFormContent,
  BlogListingContent,
  ImageGalleryContent,
  FullWidthImageContent,
  StatisticsContent,
  TestimonialsContent,
  SplitHeroContent,
  HeroContent,
  CapabilitiesGridContent,
  TechStackContent,
  CTAContent,
  EditorialTextContent,
  ProcessTimelineContent,
} from "@/lib/sections";
import { PublicContactForm } from "@/components/public/contact-form";
import { ProductCard } from "@/components/public/product-card";
import { ServiceCard } from "@/components/public/service-card";
import { ProjectCard } from "@/components/public/project-card";
import { BlogCard } from "@/components/public/blog-card";
import { StoryChapter } from "@/components/story/story-chapter";
import { HomeStoryShell } from "@/components/story/home-story-shell";
import {
  chapterForSectionType,
  chaptersFromSectionTypes,
  HOME_CHAPTER_BY_TYPE,
} from "@/components/story/chapter-map";

function parseContent<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}

// ──────────────────────────────────────────────────────────────────────
// SERVER-side section components that need DB access
// These fetch their data server-side then pass to client components or render directly.
// ──────────────────────────────────────────────────────────────────────

// Hero — pure client component (no DB)
function HeroSection({ section }: { section: PageSection }) {
  const c = parseContent<HeroContent>(section.content);
  return <HeroClient content={c} />;
}

// Capabilities — pure client (data from content)
function CapabilitiesGridSection({ section }: { section: PageSection }) {
  const c = parseContent<CapabilitiesGridContent>(section.content);
  return <CapabilitiesClient content={c} />;
}

// Product Showcase — server fetches products, passes to client
async function ProductShowcaseSection({ section }: { section: PageSection }) {
  const c = parseContent<ProductShowcaseContent>(section.content);
  const products = await db.product.findMany({
    where: { isFeatured: true },
    orderBy: { sortOrder: "asc" },
    take: c.limit ?? 2,
    include: { features: true },
  });
  return <ProductShowcaseClient content={c} products={products} />;
}

// Process Timeline — pure client
function ProcessTimelineSection({ section }: { section: PageSection }) {
  const c = parseContent<ProcessTimelineContent>(section.content);
  return <ProcessTimelineClient content={c} />;
}

// Tech Stack — pure client
function TechStackSection({ section }: { section: PageSection }) {
  const c = parseContent<TechStackContent>(section.content);
  return <TechStackClient content={c} />;
}

// Editorial Text — pure client (with counters)
function EditorialTextSection({ section }: { section: PageSection }) {
  const c = parseContent<EditorialTextContent>(section.content);
  return <EditorialTextClient content={c} />;
}

// CTA — pure client
function CTASection({ section }: { section: PageSection }) {
  const c = parseContent<CTAContent>(section.content);
  return <CTAClient content={c} />;
}

// ──────────────────────────────────────────────────────────────────────
// Sections that still use the old simple rendering (kept for compatibility)
// ──────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

// Split Hero (legacy, kept simple)
function SplitHeroSection({ section }: { section: PageSection }) {
  const c = parseContent<SplitHeroContent>(section.content);
  const Img = (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
      {c.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.image} alt={c.imageAlt ?? ""} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Icons.ImageIcon className="h-8 w-8" />
        </div>
      )}
    </div>
  );
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
        {c.layout === "left" && <div>{Img}</div>}
        <div className="space-y-6">
          {c.eyebrow && <p className="mono-label">{c.eyebrow}</p>}
          <h2 className="display-lg font-medium">{c.title}</h2>
          {c.subtitle && <p className="text-lg text-muted-foreground">{c.subtitle}</p>}
          {(c.primaryCta || c.secondaryCta) && (
            <div className="flex flex-wrap gap-3">
              {c.primaryCta && (
                <Link href={c.primaryCta.href} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                  {c.primaryCta.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
              {c.secondaryCta && (
                <Link href={c.secondaryCta.href} className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-sm font-medium">
                  {c.secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
        {c.layout !== "left" && <div>{Img}</div>}
      </div>
    </section>
  );
}

// Services List — server fetches services
async function ServicesListSection({ section }: { section: PageSection }) {
  const c = parseContent<ServicesListContent>(section.content);
  const services = await db.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    take: c.limit ?? 6,
  });
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {c.eyebrow && <p className="mono-label mb-4">{c.eyebrow}</p>}
            <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
            {c.subheading && <p className="mt-4 text-lg text-muted-foreground">{c.subheading}</p>}
          </div>
          {c.ctaLabel && c.ctaHref && (
            <Link href={c.ctaHref} className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              {c.ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} showIcon={c.showIcons} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Portfolio Grid — server fetches projects
async function PortfolioGridSection({ section }: { section: PageSection }) {
  const c = parseContent<PortfolioGridContent>(section.content);
  const projects = await db.project.findMany({
    where: {
      status: "PUBLISHED",
      ...(c.featuredOnly ? { isFeatured: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: c.limit ?? 6,
  });
  if (projects.length === 0) return null;
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {c.eyebrow && <p className="mono-label mb-4">{c.eyebrow}</p>}
            <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
          </div>
          {c.ctaLabel && c.ctaHref && (
            <Link href={c.ctaHref} className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              {c.ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Statistics — pure client (uses Counter)
import { Counter, parseMetricValue } from "@/components/motion/motion";
function StatisticsSection({ section }: { section: PageSection }) {
  const c = parseContent<StatisticsContent>(section.content);
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        {c.eyebrow && <p className="mono-label mb-4 text-primary-foreground/70">{c.eyebrow}</p>}
        {c.heading && <h2 className="display-lg mb-10 font-medium text-balance">{c.heading}</h2>}
        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {c.stats.map((s, i) => {
            const { number, prefix, suffix } = parseMetricValue(s.value);
            return (
              <div key={i}>
                <dt className="font-mono text-xs uppercase tracking-wider text-primary-foreground/70">{s.label}</dt>
                <dd className="mt-2 font-display text-4xl font-medium">
                  <Counter value={number} prefix={prefix} suffix={suffix} />
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

// Testimonials
async function TestimonialsSection({ section }: { section: PageSection }) {
  const c = parseContent<TestimonialsContent>(section.content);
  const testimonials = await db.testimonial.findMany({
    where: { status: "PUBLISHED", ...(c.featuredOnly ? { isFeatured: true } : {}) },
    orderBy: { sortOrder: "asc" },
    take: c.limit ?? 3,
  });
  if (testimonials.length === 0) return null;
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-3xl">
          {c.eyebrow && <p className="mono-label mb-4">{c.eyebrow}</p>}
          <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="rounded-lg border border-border p-6">
              <p className="text-pretty text-lg italic">{t.content}</p>
              <footer className="mt-4 text-sm">
                <span className="font-medium">{t.authorName}</span>
                {t.authorRole && (
                  <span className="text-muted-foreground"> — {t.authorRole}{t.authorCompany ? `, ${t.authorCompany}` : ""}</span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

// Image Gallery
function ImageGallerySection({ section }: { section: PageSection }) {
  const c = parseContent<ImageGalleryContent>(section.content);
  if (c.images.length === 0) return null;
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        {c.heading && <h2 className="display-lg mb-10 font-medium text-balance">{c.heading}</h2>}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(c.columns, 3)}, minmax(0, 1fr))` }}>
          {c.images.map((img, i) => (
            <figure key={i} className="overflow-hidden rounded-lg border border-border bg-muted">
              <div className="aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
              </div>
              {img.caption && <figcaption className="p-3 text-xs text-muted-foreground">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// Full-width Image
function FullWidthImageSection({ section }: { section: PageSection }) {
  const c = parseContent<FullWidthImageContent>(section.content);
  if (!c.src) return null;
  return (
    <section className="relative border-b border-border">
      <figure className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.src} alt={c.alt} className="h-[50vh] w-full object-cover lg:h-[60vh]" />
        {c.overlay && <div className="absolute inset-0 bg-background/40" />}
        {c.caption && <figcaption className="absolute bottom-0 left-0 right-0 p-4 text-xs text-background">{c.caption}</figcaption>}
      </figure>
    </section>
  );
}

// FAQ — server fetches if items empty
async function FAQSection({ section }: { section: PageSection }) {
  const c = parseContent<FAQContent>(section.content);
  let items = c.items;
  if (items.length === 0) {
    const faqs = await db.faq.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    });
    items = faqs.map((f) => ({ question: f.question, answer: f.answer }));
  }
  if (items.length === 0) return null;
  const faqJsonLd = buildFaqPageJsonLd(items);
  return (
    <section className="border-b border-border bg-background">
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-28">
        {c.eyebrow && <p className="mono-label mb-4">{c.eyebrow}</p>}
        <h2 className="display-lg mb-10 font-medium text-balance">{c.heading}</h2>
        <dl className="divide-y divide-border border-y border-border">
          {items.map((item, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <dt className="font-display text-lg font-medium">{item.question}</dt>
                <Icons.ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <dd className="mt-3 text-pretty text-muted-foreground">{item.answer}</dd>
            </details>
          ))}
        </dl>
      </div>
    </section>
  );
}

// Contact Form — server fetches services
async function ContactFormSection({ section }: { section: PageSection }) {
  const c = parseContent<ContactFormContent>(section.content);
  let services = c.services;
  if (services.length === 0) {
    const svc = await db.service.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    });
    services = svc.map((s) => s.title);
  }
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10 lg:py-28">
        <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
        {c.subheading && <p className="mt-4 text-lg text-muted-foreground">{c.subheading}</p>}
        <div className="mt-10">
          <PublicContactForm services={services} showBudget={c.showBudget} />
        </div>
      </div>
    </section>
  );
}

// Blog Listing — server fetches posts
async function BlogListingSection({ section }: { section: PageSection }) {
  const c = parseContent<BlogListingContent>(section.content);
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: c.limit ?? 3,
    include: { category: true, author: true },
  });
  if (posts.length === 0) return null;
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {c.eyebrow && <p className="mono-label mb-4">{c.eyebrow}</p>}
            <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
          </div>
          {c.ctaLabel && c.ctaHref && (
            <Link href={c.ctaHref} className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              {c.ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Section renderer
// ──────────────────────────────────────────────────────────────────────
export async function renderSection(section: PageSection): Promise<React.ReactNode> {
  if (!section.isVisible) return null;

  switch (section.sectionType) {
    case "hero":
      return <HeroSection section={section} />;
    case "split_hero":
      return <SplitHeroSection section={section} />;
    case "editorial_text":
      return <EditorialTextSection section={section} />;
    case "capabilities_grid":
      return <CapabilitiesGridSection section={section} />;
    case "services_list":
      return <ServicesListSection section={section} />;
    case "product_showcase":
      return <ProductShowcaseSection section={section} />;
    case "portfolio_grid":
      return <PortfolioGridSection section={section} />;
    case "tech_stack":
      return <TechStackSection section={section} />;
    case "process_timeline":
      return <ProcessTimelineSection section={section} />;
    case "statistics":
      return <StatisticsSection section={section} />;
    case "testimonials":
      return <TestimonialsSection section={section} />;
    case "image_gallery":
      return <ImageGallerySection section={section} />;
    case "full_width_image":
      return <FullWidthImageSection section={section} />;
    case "cta":
      return <CTASection section={section} />;
    case "faq":
      return <FAQSection section={section} />;
    case "contact_form":
      return <ContactFormSection section={section} />;
    case "blog_listing":
      return <BlogListingSection section={section} />;
    default:
      return (
        <div className="border-b border-border bg-destructive/10 p-6 text-sm text-destructive">
          Unknown section type: {section.sectionType}
        </div>
      );
  }
}

export async function PageRenderer({
  sections,
  story = false,
}: {
  sections: PageSection[];
  /** When true, wrap CMS sections as narrative chapters with progress rail. */
  story?: boolean;
}) {
  const sorted = [...sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const rendered = await Promise.all(sorted.map((s) => renderSection(s)));

  if (!story) {
    return (
      <>
        {rendered.map((node, i) => (
          <div key={sorted[i].id}>{node}</div>
        ))}
      </>
    );
  }

  const chapters = chaptersFromSectionTypes(sorted.map((s) => s.sectionType));

  return (
    <HomeStoryShell chapters={chapters}>
      {rendered.map((node, i) => {
        const section = sorted[i];
        const meta = chapterForSectionType(section.sectionType, i);
        // Hero / CTA already paint their own chapter eyebrow
        // Hero / CTA paint their own chapter eyebrow; others use overlay labels
        const showEyebrow =
          section.sectionType !== "hero" && section.sectionType !== "cta";
        const known = HOME_CHAPTER_BY_TYPE[section.sectionType];

        return (
          <StoryChapter
            key={section.id}
            id={meta.id}
            index={meta.index}
            label={meta.label}
            as="div"
            showEyebrow={showEyebrow}
            eyebrowOverlay
            className={known?.pin ? "overflow-visible" : undefined}
          >
            {node}
          </StoryChapter>
        );
      })}
    </HomeStoryShell>
  );
}
