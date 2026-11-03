"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

/** Split title for staged reveal without eating spaces inside each line. */
function splitHeroTitle(title: string): string[] {
  const normalized = title.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [title];
  if (normalized.includes("\n")) {
    return normalized
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 4);
  }
  // Split after `.` or `:` only when followed by whitespace (lookbehind keeps punctuation).
  const parts = normalized.split(/(?<=[.:])\s+/).filter((p) => p.length > 0);
  if (parts.length <= 1) return [normalized];
  return parts.slice(0, 4);
}

/** Story intro chapter for listing / detail pages — brand-first, quieter motion. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  bgImage,
  chapterIndex = "01",
  chapterLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  bgImage?: string;
  chapterIndex?: string;
  chapterLabel?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "10%"]);

  // Split only on sentence/colon boundaries; keep intra-line spaces intact (no space-glue).
  const titleLines = splitHeroTitle(title);
  const label = chapterLabel || eyebrow || "INTRO";

  return (
    <section
      ref={ref}
      id="chapter-intro"
      data-story-chapter="chapter-intro"
      className="story-chapter relative overflow-hidden border-b border-border bg-background"
    >
      {bgImage && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ y: reduce ? 0 : bgY }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            className="h-full w-full object-cover opacity-[0.08] dark:opacity-[0.12]"
          />
        </motion.div>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(8, 127, 112, 0.07), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-grid opacity-[0.02]"
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"
        style={{ y: reduce ? 0 : contentY }}
      >
        <motion.p
          className="story-chapter-eyebrow mb-8"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <span className="story-chapter-index">{chapterIndex}</span>
          <span className="story-chapter-divider" />
          <span className="story-chapter-label">{label}</span>
        </motion.p>

        <motion.h1
          className="display-xl max-w-4xl font-medium text-balance"
          initial="hidden"
          animate="show"
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                className="block"
                variants={{
                  hidden: { y: reduce ? 0 : "110%", opacity: reduce ? 1 : 0 },
                  show: {
                    y: "0%",
                    opacity: 1,
                    transition: {
                      duration: reduce ? 0 : 0.85,
                      delay: reduce ? 0 : 0.15 + i * 0.1,
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

        {subtitle && (
          <motion.p
            className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground lg:text-xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.45 }}
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            className="mt-8"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : 0.55 }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
