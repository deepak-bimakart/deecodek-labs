import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { Reveal, Counter } from "@/components/motion/motion";
import { CustomJsonLd, JsonLd } from "@/components/seo-json-ld";
import { buildFaqPageJsonLd } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { getAboutFounder } from "@/lib/about-founder";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({
    where: { slug: "about" },
    include: { seo: true },
  });
  return buildPageMetadata(page?.seo, {
    title: "About",
    description: "DeeCodeK Labs — Software Studio. Product Lab.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const [services, page, faqs, founder] = await Promise.all([
    db.service.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    db.page.findUnique({
      where: { slug: "about" },
      include: { seo: true },
    }),
    db.faq.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    }),
    getAboutFounder(),
  ]);

  const faqJsonLd = buildFaqPageJsonLd(
    faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: founder.name,
    jobTitle: "Founder",
    worksFor: {
      "@type": "Organization",
      name: "DeeCodeK Labs",
      url: "https://deecodeklabs.com",
    },
    description: founder.bio,
    ...(founder.url ? { url: founder.url } : {}),
    ...(founder.photo ? { image: founder.photo } : {}),
  };

  return (
    <PublicShell>
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <JsonLd data={personJsonLd} />
      <CustomJsonLd raw={page?.seo?.structuredData} />
      <PageHero
        eyebrow="About"
        title="We optimize for shipped, not for slides."
        subtitle="DeeCodeK Labs is a small software studio that ships production products for clients and builds its own products in parallel."
        bgImage="/images/hero/architecture.png"
      />

      <section className="border-b border-border bg-secondary/30" aria-labelledby="founder-heading">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
          <Reveal>
            <p className="mono-label mb-3">E-E-A-T · Founder</p>
            <h2 id="founder-heading" className="font-display text-3xl font-semibold">
              Who builds this
            </h2>
          </Reveal>
          <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
            {founder.photo ? (
              <Reveal>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={founder.photo}
                  alt={founder.name}
                  className="h-36 w-36 shrink-0 object-cover border border-border"
                />
              </Reveal>
            ) : (
              <Reveal>
                <div
                  className="flex h-36 w-36 shrink-0 items-center justify-center border border-border bg-background font-display text-4xl font-semibold text-primary"
                  aria-hidden
                >
                  {founder.name.slice(0, 1).toUpperCase()}
                </div>
              </Reveal>
            )}
            <Reveal delay={0.1}>
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-semibold">{founder.name}</h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Founder · DeeCodeK Labs
                </p>
                <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                  {founder.bio}
                </p>
                {founder.url && (
                  <Link
                    href={founder.url}
                    className="inline-flex text-sm text-primary underline-offset-4 hover:underline"
                  >
                    More about the studio
                  </Link>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-semibold">How we work</h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Most studios sell decks. We ship production software — the kind that has real users, real billing, and real 3am pages. Every engagement starts with a six-week path to a working product, not a 60-page proposal.
            </p>
            <Reveal delay={0.1}>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                We&apos;re a small studio on purpose. The person who writes the schema is the
                person who writes the deploy script is the person who answers the on-call. No relay
                race, no hand-offs.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                And we build our own products in parallel — so the code we ship to clients is
                informed by what we learn running software in production ourselves.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-4">
              {[
                { label: "Years building", prefix: "", number: 8, suffix: "+" },
                { label: "Products in production", prefix: "", number: 12, suffix: "" },
                { label: "Client codebases", prefix: "", number: 30, suffix: "+" },
                { label: "Avg. response time", prefix: "<", number: 4, suffix: "h" },
              ].map((s, i) => {
                return (
                  <div key={i}>
                    <dt className="mono-label">{s.label}</dt>
                    <dd className="mt-1.5 font-display text-3xl font-semibold tracking-tight">
                      <Counter value={s.number} prefix={s.prefix} suffix={s.suffix} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>
        </div>
      </section>

      {services.length > 0 && (
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold">What we ship</h2>
            </Reveal>
            <ul className="mt-8 space-y-4">
              {services.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.08}>
                  <li className="flex items-start gap-4 border-b border-border pb-4 last:border-0">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(s.sortOrder).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        <Link href={`/services/${s.slug}`} className="hover:text-primary">
                          {s.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">{s.summary}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
            <Reveal>
              <h2 className="display-lg font-medium">Common questions</h2>
            </Reveal>
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {faqs.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.05}>
                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <dt className="font-display text-lg font-medium">{f.question}</dt>
                      <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <dd className="mt-3 text-pretty text-muted-foreground">{f.answer}</dd>
                  </details>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
