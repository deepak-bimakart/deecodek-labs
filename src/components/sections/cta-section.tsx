"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { CTAContent } from "@/lib/sections";

export function CTASection({ content }: { content: CTAContent }) {
  const reduce = useReducedMotion();
  const c = content;
  const isBanner = c.variant === "banner";

  return (
    <section
      className={`relative overflow-hidden border-b border-border ${
        isBanner ? "bg-background" : "bg-primary text-primary-foreground"
      }`}
    >
      {/* Subtle gradient + pattern overlay */}
      {!isBanner && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,255,255,0.08), transparent 70%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />
        </>
      )}

      <div className="relative mx-auto max-w-5xl px-6 py-20 text-center lg:px-10 lg:py-28">
        <motion.p
          className={`story-chapter-eyebrow mb-8 justify-center ${
            isBanner ? "" : "[&_.story-chapter-label]:text-primary-foreground/70 [&_.story-chapter-divider]:bg-primary-foreground/50"
          }`}
          style={isBanner ? undefined : ({ color: "inherit" } as CSSProperties)}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="story-chapter-index">07</span>
          <span className="story-chapter-divider" />
          <span className="story-chapter-label">NEXT</span>
        </motion.p>

        {/* Headline reveal */}
        <motion.h2
          className={`display-lg mx-auto max-w-3xl font-medium text-balance ${
            isBanner ? "" : "text-primary-foreground"
          }`}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {c.heading}
        </motion.h2>

        {/* Subheading */}
        {c.subheading && (
          <motion.p
            className={`mt-6 text-lg ${
              isBanner ? "text-muted-foreground" : "text-primary-foreground/80"
            }`}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {c.subheading}
          </motion.p>
        )}

        {/* Buttons */}
        {(c.primaryCta || c.secondaryCta) && (
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {c.primaryCta && (
              <Link
                href={c.primaryCta.href}
                className={`group inline-flex items-center gap-1.5 rounded-md px-5 py-3 text-sm font-medium transition-all duration-300 hover:shadow-lg ${
                  isBanner
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20"
                    : "bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:shadow-lg"
                }`}
              >
                {c.primaryCta.label}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
            {c.secondaryCta && (
              <Link
                href={c.secondaryCta.href}
                className={`group inline-flex items-center gap-1.5 rounded-md border px-5 py-3 text-sm font-medium transition-all duration-300 ${
                  isBanner
                    ? "border-border hover:border-primary/40 hover:bg-muted"
                    : "border-primary-foreground/30 hover:bg-primary-foreground/10"
                }`}
              >
                {c.secondaryCta.label}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
