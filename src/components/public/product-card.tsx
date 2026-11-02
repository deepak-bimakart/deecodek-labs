import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@prisma/client";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  coming_soon: { label: "Coming Soon", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  in_development: { label: "In Development", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  launched: { label: "Live", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  archived: { label: "Archived", tone: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
};

export function ProductCard({ product }: { product: Product }) {
  const status = STATUS_LABELS[product.status] ?? STATUS_LABELS.in_development;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg lg:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mono-label mb-2">{product.category}</p>
          <h3 className="font-display text-2xl font-semibold tracking-tight">
            {product.name}
          </h3>
          {product.tagline && (
            <p className="mt-1 font-mono text-sm text-primary">{product.tagline}</p>
          )}
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <p className="mt-4 flex-1 text-pretty text-sm text-muted-foreground">
        {product.summary}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.tone}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status.label}
        </span>
        <span className="text-xs text-muted-foreground">View details →</span>
      </div>
    </Link>
  );
}
