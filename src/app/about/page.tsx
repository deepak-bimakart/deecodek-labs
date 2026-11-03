import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { Reveal, Counter } from "@/components/motion/motion";
import { CustomJsonLd, JsonLd } from "@/components/seo-json-ld";
import { buildFaqPageJsonLd } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/seo";

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
  const services = await db.service.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { sortOrder: "asc" },
    take: 4,
  });
  const page = await db.page.findUnique({
    where: { slug: "about" },
    include: { seo: true },
  });
  const faqs = await db.faq.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
  const faqJsonLd = buildFaqPageJsonLd(
    faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <PublicShell>
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <CustomJsonLd raw={page?.seo?.structuredData} />
      <PageHero
        eyebrow="About"
        title="We optimize for shipped, not for slides."
        subtitle="DeeCodeK Labs is a small software studio that ships production products for clients and builds its own products in parallel."
        bgImage="/images/hero/architecture.png"
      />

      <section className="border-b border-border bg-secondary/30">
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
        <section className="border-b border-border bg-background">
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
                      <h3 className="font-display text-lg font-semibold">{s.title}</h3>
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
        <section className="border-b border-border bg-secondary/30">
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
