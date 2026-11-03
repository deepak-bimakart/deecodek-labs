"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Counter, parseMetricValue } from "@/components/motion/motion";
import type { EditorialTextContent } from "@/lib/sections";

export function EditorialTextSection({ content }: { content: EditorialTextContent }) {
  const reduce = useReducedMotion();
  const c = content;
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
        <div ref={imageRef} className="relative overflow-hidden rounded-xl border border-border">
          <motion.div
            className="relative aspect-[4/5] lg:aspect-[3/4]"
            style={{ y: reduce ? 0 : imageY, scale: reduce ? 1 : imageScale }}
          >
            <Image
              src="/images/optimized/hero/architecture.jpg"
              alt="System architecture visualization — DeeCodeK Labs engineering map"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              quality={78}
            />
          </motion.div>
          <div className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-1 backdrop-blur-md">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              system map
            </span>
          </div>
          <div className="absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-1 backdrop-blur-md">
            <span className="font-mono text-[10px] text-primary">/ production</span>
          </div>
        </div>

        <div className="flex flex-col">
          {c.eyebrow && <p className="eyebrow-lab mb-6">{c.eyebrow}</p>}
          <h2 className="display-lg max-w-xl font-medium text-balance">{c.heading}</h2>
          <div className="mt-8 space-y-5">
            {c.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                className="text-pretty text-lg leading-relaxed text-muted-foreground"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              >
                {p}
              </motion.p>
            ))}
          </div>
          {c.pullQuote && (
            <blockquote className="mt-10 border-l-2 border-primary pl-6 font-display text-xl font-medium italic">
              {c.pullQuote}
            </blockquote>
          )}
        </div>
      </div>

      {c.stats && c.stats.length > 0 && (
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 border-t border-border px-6 py-12 sm:grid-cols-4 lg:px-10">
          {c.stats.map((s, i) => {
            const { number, prefix, suffix } = parseMetricValue(s.value);
            return (
              <div key={i}>
                <dt className="mono-label">{s.label}</dt>
                <dd className="mt-1.5 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                  <Counter value={number} prefix={prefix} suffix={suffix} />
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}
