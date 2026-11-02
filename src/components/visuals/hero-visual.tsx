"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Editorial terminal panel — teal brand, no fake SaaS metrics. */
export function HeroVisual() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: 0.4,
      },
    },
  };
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className="relative h-full w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div
        className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-4 h-48 w-48 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <motion.div
        variants={item}
        className="relative z-20 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-primary/5"
      >
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
          <div className="ml-3 flex-1 truncate rounded-md bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            visitor@deecodek — studio
          </div>
        </div>

        <div className="space-y-1.5 bg-[#0a1210] px-5 py-5 font-mono text-[12px] leading-relaxed dark:bg-[#05090d]">
          <p className="text-primary/50"># DeeCodeK Labs — studio toolchain</p>
          <p>
            <span className="text-primary">$ </span>
            <span className="text-[#e8f5eb]">deecodek status --studio</span>
          </p>
          <p className="h-2" />
          <p>
            <span className="text-primary">services</span>
            <span className="text-[#8fa896]">  custom products · backends · apps</span>
          </p>
          <p>
            <span className="text-primary">lab</span>
            <span className="text-[#8fa896]">       opensource.deecodeklabs.com</span>
          </p>
          <p>
            <span className="text-primary">stack</span>
            <span className="text-[#8fa896]">     Next.js · Prisma · Flutter · Go</span>
          </p>
          <p className="h-2" />
          <p className="text-primary">✓ building useful things in the open</p>
          <div className="flex items-center gap-1 pt-2">
            <span className="text-primary">$</span>
            <span className="inline-block h-3.5 w-[7px] animate-pulse bg-primary" />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="absolute -bottom-3 -left-3 z-30 hidden rounded-lg border border-border bg-card px-3 py-2 shadow-md sm:block"
      >
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Shipping
        </p>
        <p className="text-xs font-medium text-foreground">Studio + Product Lab</p>
      </motion.div>
    </motion.div>
  );
}
