"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TechLogo } from "@/components/visuals/tech-logos";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import type { TechStackContent } from "@/lib/sections";

export function TechStackSection({ content }: { content: TechStackContent }) {
  const reduce = useReducedMotion();
  const c = content;

  // Flatten all techs for the marquee
  const allTechs = c.groups.flatMap((g) => g.items);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const groupVariant = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <>
      <section className="border-b border-border bg-secondary/50 py-3.5 text-muted-foreground">
        <VelocityMarquee baseVelocity={0.8}>
          {allTechs.map((tech, i) => (
            <span key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              <TechLogo name={tech} className="h-3.5 w-3.5 opacity-70" />
              {tech}
              <span className="ml-8 text-primary/50">✳</span>
            </span>
          ))}
        </VelocityMarquee>
      </section>

      {/* Main tech stack section with grid */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          {/* Header */}
          <motion.div
            className="max-w-3xl"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {c.eyebrow && <p className="eyebrow-lab mb-4">{c.eyebrow}</p>}
            <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
          </motion.div>

          {/* Tech groups with real SVG logos */}
          <motion.div
            className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-4"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={container}
          >
            {c.groups.map((group, gi) => (
              <motion.div key={gi} variants={groupVariant} className="bg-background p-6">
                <p className="mono-label mb-4">{group.label}</p>
                <motion.ul
                  className="space-y-2"
                  initial={reduce ? false : "hidden"}
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={container}
                >
                  {group.items.map((tech, ti) => (
                    <motion.li
                      key={ti}
                      variants={{
                        hidden: { opacity: 0, y: reduce ? 0 : 8 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
                        },
                      }}
                      className="group flex cursor-default items-center gap-3 rounded px-2 py-1.5 -mx-2 transition-colors hover:bg-brand-soft"
                      title={`${tech} — part of our ${group.label.toLowerCase()} stack`}
                    >
                      <TechLogo
                        name={tech}
                        className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                      />
                      <span className="font-mono text-sm transition-colors group-hover:text-primary">
                        {tech}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
