"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroVisual } from "@/components/visuals/hero-visual";
import type { HeroContent } from "@/lib/sections";

export function HeroSection({ content }: { content: HeroContent }) {
  const reduce = useReducedMotion();
  const c = content;

  // Keep above-fold motion light: no scroll-linked parallax, no opacity:0 on LCP text.
  const softIn = reduce
    ? undefined
    : {
        initial: { opacity: 0.92, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Ambient background — true LCP image candidate */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src="/images/optimized/hero/ambient-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.12] dark:opacity-[0.18]"
          quality={70}
        />
      </div>

      {/* Teal radial gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(8, 127, 112, 0.08), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-grid opacity-[0.025]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:py-24">
        {/* LEFT: copy column — paint immediately for LCP */}
        <div className="flex flex-col">
          {c.eyebrow && <p className="eyebrow-lab mb-6">{c.eyebrow}</p>}

          <h1 className="display-xl max-w-xl font-medium text-balance">{c.title}</h1>

          {c.subtitle && (
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:text-xl">
              {c.subtitle}
            </p>
          )}

          {(c.primaryCta || c.secondaryCta) && (
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-3"
              {...(softIn ?? {})}
            >
              {c.primaryCta && (
                <Link
                  href={c.primaryCta.href}
                  className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                >
                  {c.primaryCta.label}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )}
              {c.secondaryCta && (
                <Link
                  href={c.secondaryCta.href}
                  className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-5 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-muted"
                >
                  {c.secondaryCta.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              )}
            </motion.div>
          )}

          {c.metrics && c.metrics.length > 0 && (
            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8 lg:max-w-md">
              {c.metrics.map((m, i) => (
                <div key={i}>
                  <dt className="mono-label">{m.label}</dt>
                  <dd className="mt-1.5 font-display text-2xl font-semibold tracking-tight lg:text-3xl">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* RIGHT: visual — deferred soft entrance only */}
        <motion.div
          className="relative h-[420px] sm:h-[480px] lg:h-[520px]"
          initial={reduce ? false : { opacity: 0.85, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
