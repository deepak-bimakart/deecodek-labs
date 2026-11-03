"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product, ProductFeature } from "@prisma/client";
import type { ProductShowcaseContent } from "@/lib/sections";

type ProductWithFeatures = Product & { features: ProductFeature[] };

const STATUS_TONES: Record<string, { label: string; tone: string }> = {
  coming_soon: { label: "Coming Soon", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  in_development: { label: "In Development", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  launched: { label: "Live", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  archived: { label: "Archived", tone: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
};

const PRODUCT_IMAGES: Record<string, string> = {
  marketflow: "/images/optimized/products/marketflow-dashboard.jpg",
  sadika: "/images/optimized/products/sadika-app.jpg",
};

export function ProductShowcaseSection({
  content,
  products,
}: {
  content: ProductShowcaseContent;
  products: ProductWithFeatures[];
}) {
  const reduce = useReducedMotion();
  const c = content;
  const items = products.slice(0, c.limit ?? 4);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {c.eyebrow && <p className="eyebrow-lab mb-4">{c.eyebrow}</p>}
            <h2 className="display-lg font-medium text-balance">{c.heading}</h2>
            {c.subheading && (
              <p className="mt-4 text-lg text-muted-foreground">{c.subheading}</p>
            )}
          </div>
          {c.ctaLabel && c.ctaHref && (
            <Link
              href={c.ctaHref}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {c.ctaLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {items.length > 0 && (
          <motion.div
            className="mt-12 grid gap-6 md:grid-cols-2"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={container}
          >
            {items.map((product) => {
              const status = STATUS_TONES[product.status] ?? STATUS_TONES.in_development;
              let technologies: string[] = [];
              try {
                technologies = JSON.parse(product.technologies ?? "[]");
              } catch {}
              const imageSrc = product.coverImage || PRODUCT_IMAGES[product.slug];

              return (
                <motion.div key={product.id} variants={item}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="card-lab group block h-full overflow-hidden rounded-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {imageSrc ? (
                        imageSrc.startsWith("/") ? (
                          <Image
                            src={imageSrc}
                            alt={`${product.name} — ${product.tagline ?? "product preview"}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            quality={75}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageSrc}
                            alt={`${product.name} — ${product.tagline ?? "product preview"}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <span className="font-mono text-xs">{product.category}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

                      <div className="absolute right-3 top-3 z-10">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${status.tone}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status.label}
                        </span>
                      </div>

                      {product.category && (
                        <div className="absolute left-3 top-3 z-10">
                          <span className="rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-md">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 lg:p-7">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-2xl font-semibold tracking-tight">
                            {product.name}
                          </h3>
                          {product.tagline && (
                            <p className="mt-1 font-mono text-sm text-primary">{product.tagline}</p>
                          )}
                        </div>
                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                      </div>

                      <p className="mt-4 line-clamp-2 text-pretty text-sm text-muted-foreground">
                        {product.summary}
                      </p>

                      {technologies.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {technologies.slice(0, 5).map((t, i) => (
                            <span
                              key={i}
                              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                          {technologies.length > 5 && (
                            <span className="rounded-md px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                              +{technologies.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
