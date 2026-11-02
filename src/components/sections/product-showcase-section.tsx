"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product, ProductFeature } from "@prisma/client";
import { HorizontalPinScroll } from "@/components/motion/horizontal-pin-scroll";

type ProductWithFeatures = Product & { features: ProductFeature[] };

const STATUS_TONES: Record<string, { label: string; tone: string }> = {
  coming_soon: { label: "Coming Soon", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  in_development: { label: "In Development", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  launched: { label: "Live", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  archived: { label: "Archived", tone: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
};

const PRODUCT_IMAGES: Record<string, string> = {
  marketflow: "/images/products/marketflow-dashboard.png",
  sadika: "/images/products/sadika-app.png",
};

function ProductPanel({
  product,
  index,
  total,
  fullWidth = false,
}: {
  product: ProductWithFeatures;
  index: number;
  total: number;
  fullWidth?: boolean;
}) {
  const status = STATUS_TONES[product.status] ?? STATUS_TONES.in_development;
  let technologies: string[] = [];
  try {
    technologies = JSON.parse(product.technologies ?? "[]");
  } catch {}
  const imageSrc = PRODUCT_IMAGES[product.slug];

  return (
    <Link
      href={`/products/${product.slug}`}
      className={
        fullWidth
          ? "group flex h-full w-full flex-col bg-background px-6 py-10 transition-colors hover:bg-secondary/40 lg:px-10 lg:py-12"
          : "group flex h-full w-[min(88vw,560px)] shrink-0 flex-col border-r border-border bg-background px-6 py-10 transition-colors hover:bg-secondary/40 lg:w-[min(70vw,720px)] lg:px-12 lg:py-14"
      }
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${status.tone}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status.label}
        </span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden border border-border bg-muted">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={`${product.name} — ${product.tagline ?? "product preview"}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="font-mono text-xs">{product.category}</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            {product.name}
          </h3>
          {product.tagline && (
            <p className="mt-2 font-mono text-sm text-primary">{product.tagline}</p>
          )}
        </div>
        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <p className="mt-4 max-w-xl text-pretty text-muted-foreground line-clamp-3">
        {product.summary}
      </p>

      {technologies.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-8">
          {technologies.slice(0, 5).map((t, i) => (
            <span
              key={i}
              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export function ProductShowcaseSection({
  content,
  products,
}: {
  content: any;
  products: ProductWithFeatures[];
}) {
  const reduce = useReducedMotion();
  const c = content;
  const items = products.slice(0, c.limit ?? 4);

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-20 lg:px-10 lg:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-6 pt-8">
          <div className="max-w-3xl">
            {c.eyebrow && <p className="mono-label mb-4">{c.eyebrow}</p>}
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
      </div>

      {items.length === 0 ? null : reduce ? (
        <div className="mx-auto grid max-w-7xl gap-px border-t border-border bg-border px-0 pb-0 md:grid-cols-2">
          {items.map((product, i) => (
            <div key={product.id} className="bg-background">
              <ProductPanel product={product} index={i} total={items.length} fullWidth />
            </div>
          ))}
        </div>
      ) : (
        <HorizontalPinScroll className="border-t border-border" pinClassName="h-screen">
          <div className="flex h-screen min-w-full items-stretch">
            <div className="flex w-[min(40vw,420px)] shrink-0 flex-col justify-end border-r border-border bg-secondary/40 px-8 pb-16 lg:px-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Scroll sideways
              </p>
              <p className="mt-3 font-display text-2xl font-medium tracking-tight">
                Products from the lab
              </p>
            </div>
            {items.map((product, i) => (
              <ProductPanel
                key={product.id}
                product={product}
                index={i}
                total={items.length}
              />
            ))}
            {c.ctaHref && (
              <div className="flex w-[min(70vw,480px)] shrink-0 items-center justify-center bg-primary px-10 text-primary-foreground">
                <Link
                  href={c.ctaHref}
                  className="group inline-flex items-center gap-2 font-display text-2xl font-medium"
                >
                  {c.ctaLabel ?? "All products"}
                  <ArrowUpRight className="h-6 w-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </HorizontalPinScroll>
      )}
    </section>
  );
}
