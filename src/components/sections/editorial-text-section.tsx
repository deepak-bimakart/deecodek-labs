"use client";

import { useReducedMotion } from "framer-motion";
import { Counter, parseMetricValue } from "@/components/motion/motion";
import { PinnedSplit, ScrubLine } from "@/components/story/pinned-split";
import type { EditorialTextContent } from "@/lib/sections";

export function EditorialTextSection({ content }: { content: EditorialTextContent }) {
  const reduce = useReducedMotion();
  const c = content;

  const visual = (
    <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-border bg-card lg:aspect-[3/4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero/architecture.png"
        alt="System architecture visualization — DeeCodeK Labs engineering map"
        className="h-full w-full object-cover"
      />
      <div className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-1 backdrop-blur-md">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          system map
        </span>
      </div>
      <div className="absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-1 backdrop-blur-md">
        <span className="font-mono text-[10px] text-primary">/ production</span>
      </div>
    </div>
  );

  const narrative = (
    <div className="flex flex-col pt-10 lg:pt-0">
      {c.eyebrow && (
        <ScrubLine>
          <p className="mono-label mb-6">{c.eyebrow}</p>
        </ScrubLine>
      )}
      <ScrubLine>
        <h2 className="display-lg max-w-xl font-medium text-balance">{c.heading}</h2>
      </ScrubLine>
      <div className="mt-8 space-y-5">
        {c.paragraphs.map((p, i) => (
          <ScrubLine key={i}>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{p}</p>
          </ScrubLine>
        ))}
      </div>
      {c.pullQuote && (
        <ScrubLine>
          <blockquote className="mt-10 border-l-2 border-primary pl-6 font-display text-xl font-medium italic">
            {c.pullQuote}
          </blockquote>
        </ScrubLine>
      )}
    </div>
  );

  return (
    <div className="border-b border-border bg-background">
      <PinnedSplit visual={visual} narrative={narrative} pinHeight={reduce ? undefined : "180vh"} />

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
    </div>
  );
}
