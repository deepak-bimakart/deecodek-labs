import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import type { Service } from "@prisma/client";

export function ServiceCard({ service, showIcon = true }: { service: Service; showIcon?: boolean }) {
  const lib = Icons as any;
  const Icon = lib[service.icon ?? "Sparkles"] ?? Icons.Sparkles;
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        {showIcon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
        {service.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {service.summary}
      </p>
      <span className="mt-4 font-mono text-xs text-muted-foreground">
        Learn more →
      </span>
    </Link>
  );
}
