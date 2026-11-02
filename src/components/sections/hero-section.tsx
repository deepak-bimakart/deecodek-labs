"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HeroVisual } from "@/components/visuals/hero-visual";
import type { HeroContent } from "@/lib/sections";

export function HeroSection({ content }: { content: HeroContent }) {
  const reduce = useReducedMotion();
  const c = content;
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax for background + visual
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const visualY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Split title into lines for line-by-line reveal
  const titleLines = c.title
    ? c.title.split(/(?<=\.)\s+|(?<=ships)/i).filter(Boolean).slice(0, 4)
    : [""];
  const lines = titleLines.length > 1 ? titleLines : [c.title];

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-border bg-background">
      {/* Ambient background image with parallax */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y: reduce ? 0 : bgY }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero/ambient-bg.png"
          alt=""
          className="h-full w-full object-cover opacity-[0.12] dark:opacity-[0.18]"
        />
      </motion.div>

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
        {/* LEFT: copy column */}
        <motion.div style={{ y: reduce ? 0 : textY }} className="flex flex-col">
          {/* Chapter hook eyebrow */}
          <motion.p
            className="story-chapter-eyebrow mb-6"
            custom={0.1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <span className="story-chapter-index">00</span>
            <span className="story-chapter-divider" />
            <span className="story-chapter-label">{c.eyebrow || "THE HOOK"}</span>
          </motion.p>

          {/* Headline — line by line with overflow mask */}
          <motion.h1
            className="display-xl max-w-xl font-medium text-balance"
            initial="hidden"
            animate="show"
          >
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  className="block"
                  variants={{
                    hidden: { y: "110%", opacity: 0 },
                    show: {
                      y: "0%",
                      opacity: 1,
                      transition: {
                        duration: 0.9,
                        delay: 0.2 + i * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    },
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          {c.subtitle && (
            <motion.p
              className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:text-xl"
              custom={0.6}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              {c.subtitle}
            </motion.p>
          )}

          {/* CTAs */}
          {(c.primaryCta || c.secondaryCta) && (
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-3"
              custom={0.75}
              variants={fadeUp}
              initial="hidden"
              animate="show"
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

          {/* Metrics */}
          {c.metrics && c.metrics.length > 0 && (
            <motion.dl
              className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8 lg:max-w-md"
              custom={0.9}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              {c.metrics.map((m, i) => (
                <div key={i}>
                  <dt className="mono-label">{m.label}</dt>
                  <dd className="mt-1.5 font-display text-2xl font-semibold tracking-tight lg:text-3xl">
                    {m.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </motion.div>

        {/* RIGHT: animated visual with parallax */}
        <motion.div
          className="relative h-[420px] sm:h-[480px] lg:h-[520px]"
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            y: reduce ? 0 : visualY,
            scale: reduce ? 1 : visualScale,
          }}
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
