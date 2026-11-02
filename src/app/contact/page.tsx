import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PageHero } from "@/components/public/page-hero";
import { PublicContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/motion/motion";
import { StoryChapter } from "@/components/story/story-chapter";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({
    where: { slug: "contact" },
    include: { seo: true },
  });
  return buildPageMetadata(page?.seo, {
    title: "Contact",
    description:
      "Tell us what you want to ship. We'll tell you, honestly, whether it's a six-week build or a six-month one.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const services = await db.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    select: { title: true },
  });

  return (
    <PublicShell>
      <PageHero
        eyebrow="Contact"
        title="Build with us."
        subtitle="Tell us what you want to ship. We'll tell you, honestly, whether it's a six-week build or a six-month one — and what the first six weeks would look like."
        chapterIndex="01"
        chapterLabel="CLOSE"
      />

      <StoryChapter id="chapter-brief" index="02" label="BRIEF" className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-4 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:px-10 lg:pb-24">
          <Reveal>
            <div className="space-y-6">
              <p className="text-pretty text-lg text-muted-foreground">
                The more context you share, the faster we can respond usefully. This is the last
                chapter of most journeys through the site — make it count.
              </p>
              <div className="mt-8 space-y-6 border-t border-border pt-8">
                <div>
                  <p className="mono-label">Email</p>
                  <a
                    href="mailto:hello@deecodeklabs.com"
                    className="font-display text-lg hover:text-primary"
                  >
                    hello@deecodeklabs.com
                  </a>
                </div>
                <div>
                  <p className="mono-label">Response time</p>
                  <p className="font-display text-lg">Within 24 hours</p>
                </div>
                <div>
                  <p className="mono-label">Engagement model</p>
                  <p className="font-display text-lg">Six-week v0.1, then monthly retainer</p>
                </div>
                <div>
                  <p className="mono-label">Open source</p>
                  <a
                    href="https://opensource.deecodeklabs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-display text-lg hover:text-primary"
                  >
                    opensource.deecodeklabs.com →
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="border border-border bg-card p-6 lg:p-8">
              <p className="mono-label mb-2">Project brief</p>
              <h2 className="font-display text-xl font-semibold">What should we ship?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Constraints welcome. Vague pitches get vague replies.
              </p>
              <div className="mt-6">
                <PublicContactForm services={services.map((s) => s.title)} showBudget />
              </div>
            </div>
          </Reveal>
        </div>
      </StoryChapter>
    </PublicShell>
  );
}
