"use client";

import { useReducedMotion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { CAPABILITY_VISUALS } from "@/components/visuals/capability-visuals";
import { StackingCards, StackingCard } from "@/components/motion/stacking-cards";
import type { CapabilitiesGridContent } from "@/lib/sections";

function getIcon(name: string) {
  const lib = Icons as any;
  return (lib[name] ?? Icons.Sparkles) as Icons.LucideIcon;
}

export function CapabilitiesSection({ content }: { content: CapabilitiesGridContent }) {
  const reduce = useReducedMotion();
  const c = content;

  return (
    <section className="relative border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-20 lg:px-10 lg:pt-28">
        <div className="max-w-3xl pt-8">
          {c.eyebrow && <p className="eyebrow-lab mb-4">{c.eyebrow}</p>}
          <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
          {c.subheading && (
            <p className="mt-4 text-lg text-muted-foreground">{c.subheading}</p>
          )}
        </div>
      </div>

      {reduce ? (
        <div className="mx-auto max-w-7xl space-y-4 px-6 pb-20 lg:px-10 lg:pb-28">
          {c.items.map((capItem, i) => {
            const Icon = getIcon(capItem.icon);
            const Visual = CAPABILITY_VISUALS[capItem.icon];
            return (
              <div key={i} className="card-lab rounded-xl p-7 lg:p-10">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-brand-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">
                  {capItem.title}
                </h3>
                <p className="mt-3 max-w-2xl text-muted-foreground">{capItem.description}</p>
                {Visual && (
                  <div className="mt-6 max-w-md opacity-70">
                    <Visual />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <StackingCards className="mx-auto max-w-7xl px-6 pb-[20vh] lg:px-10">
          {c.items.map((capItem, i) => {
            const Icon = getIcon(capItem.icon);
            const Visual = CAPABILITY_VISUALS[capItem.icon];
            return (
              <StackingCard key={i} className="pb-8">
                <div className="card-lab group relative min-h-[55vh] rounded-xl border border-border bg-background p-7 shadow-[0_-12px_40px_rgba(0,0,0,0.04)] lg:p-12">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-brand-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {String(i + 1).padStart(2, "0")} / {String(c.items.length).padStart(2, "0")}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </div>
                  <h3 className="mt-10 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                    {capItem.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                    {capItem.description}
                  </p>
                  {Visual && (
                    <div className="mt-8 max-w-lg opacity-60 transition-opacity duration-300 group-hover:opacity-90">
                      <Visual />
                    </div>
                  )}
                </div>
              </StackingCard>
            );
          })}
        </StackingCards>
      )}
    </section>
  );
}
