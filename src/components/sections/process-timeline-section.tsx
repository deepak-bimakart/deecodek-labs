"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ProcessTimelineContent } from "@/lib/sections";

export function ProcessTimelineSection({ content }: { content: ProcessTimelineContent }) {
  const reduce = useReducedMotion();
  const c = content;
  const steps = c.steps ?? [];

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-3xl">
          {c.eyebrow && <p className="eyebrow-lab mb-4">{c.eyebrow}</p>}
          <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
          {c.subheading && (
            <p className="mt-4 text-lg text-muted-foreground">{c.subheading}</p>
          )}
        </div>

        <ol className="mt-16 space-y-0">
          {steps.map((step, i) => (
            <motion.li
              key={i}
              className="relative grid gap-4 border-t border-border py-10 md:grid-cols-[120px_1fr_1fr] md:gap-10"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06 }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background font-mono text-xs font-semibold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.duration && (
                  <span className="rounded-md bg-brand-soft px-2 py-0.5 font-mono text-[10px] text-primary md:hidden">
                    {step.duration}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                {step.duration && (
                  <span className="mt-2 hidden rounded-md bg-brand-soft px-2 py-0.5 font-mono text-[10px] text-primary md:inline-block">
                    {step.duration}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground md:pt-1">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
