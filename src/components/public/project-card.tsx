import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@prisma/client";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-muted">
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverImage} alt={project.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="font-mono text-xs">{project.category}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium">
            View case study →
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="mono-label mb-1">{project.category}</p>
        <h3 className="font-display text-lg font-semibold">{project.name}</h3>
        {project.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
        )}
      </div>
    </Link>
  );
}
