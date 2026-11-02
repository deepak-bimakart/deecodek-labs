"use client";

import { motion, useReducedMotion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { CAPABILITY_VISUALS } from "@/components/visuals/capability-visuals";
import type { CapabilitiesGridContent } from "@/lib/sections";

function getIcon(name: string) {
  const lib = Icons as any;
  return (lib[name] ?? Icons.Sparkles) as Icons.LucideIcon;
}

export function CapabilitiesSection({ content }: { content: CapabilitiesGridContent }) {
  const reduce = useReducedMotion();
  const c = content;
  const cols = Math.min(c.columns ?? 3, 3);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="relative border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <motion.div
          className="max-w-3xl"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={container}
        >
          {c.eyebrow && (
            <motion.p variants={item} className="eyebrow-lab mb-4">
              {c.eyebrow}
            </motion.p>
          )}
          <motion.h2 variants={item} className="display-lg font-medium text-balance">
            {c.heading}
          </motion.h2>
          {c.subheading && (
            <motion.p variants={item} className="mt-4 text-lg text-muted-foreground">
              {c.subheading}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="mt-12 grid gap-3 sm:grid-cols-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={container}
        >
          {c.items.map((capItem, i) => {
            const Icon = getIcon(capItem.icon);
            const Visual = CAPABILITY_VISUALS[capItem.icon];
            return (
              <motion.div key={i} variants={item}>
                <div className="card-lab group relative h-full rounded-xl p-7">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-brand-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold tracking-tight">
                    {capItem.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{capItem.description}</p>
                  {Visual && (
                    <div className="mt-5 overflow-hidden opacity-50 transition-opacity duration-300 group-hover:opacity-90">
                      <Visual />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
