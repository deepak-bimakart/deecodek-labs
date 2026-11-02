"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Github, ExternalLink, Star, GitFork, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type OSSProject = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  category?: string;
  technologies?: string[];
  stars?: number;
  forks?: number;
  isFeatured?: boolean;
  sortOrder?: number;
  status?: string;
  createdAt?: string;
  symbol?: string;
  filterCat?: string;
};

export function OpenSourceManager({
  initialProjects,
  ossUrl,
}: {
  initialProjects: OSSProject[];
  ossUrl: string;
}) {
  const [projects, setProjects] = useState(initialProjects);

  async function persistProjects(next: OSSProject[]) {
    const res = await fetch("/api/admin/opensource", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects: next }),
    });
    if (!res.ok) throw new Error("Failed");
    setProjects(next);
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/opensource?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function toggleFeatured(p: OSSProject) {
    try {
      const next = projects.map((x) => ({
        ...x,
        isFeatured: x.id === p.id ? !p.isFeatured : false,
      }));
      await persistProjects(next);
      toast.success(p.isFeatured ? "Unfeatured" : "Set as featured");
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          OSS Projects ({projects.length}) · live on {ossUrl}
        </p>
        <Button size="sm" asChild>
          <Link href="/admin/opensource/new">
            <Plus className="mr-2 h-3.5 w-3.5" /> Add project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center">
          <Github className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium text-sm">No open source projects yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first project — it&apos;ll appear on {ossUrl}.
          </p>
          <Button size="sm" className="mt-4" asChild>
            <Link href="/admin/opensource/new">
              <Plus className="mr-2 h-3.5 w-3.5" /> Add your first project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {projects.map((p) => (
            <div key={p.id} className="flex items-start gap-4 p-4 hover:bg-muted/20">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border font-mono text-sm">
                {p.symbol ?? "⚙"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/opensource/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  {p.isFeatured && <Badge variant="outline" className="text-[10px]">Featured</Badge>}
                  <Badge
                    variant="outline"
                    className={
                      p.status === "active"
                        ? "text-[10px] text-emerald-600"
                        : p.status === "wip"
                        ? "text-[10px] text-amber-600"
                        : "text-[10px] text-muted-foreground"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                {p.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {p.category && <span className="font-mono">{p.category}</span>}
                  {p.filterCat && <span className="font-mono opacity-70">filter:{p.filterCat}</span>}
                  {p.repoUrl && (
                    <a href={p.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                      <Github className="h-3 w-3" /> Repo
                    </a>
                  )}
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                      <ExternalLink className="h-3 w-3" /> Demo
                    </a>
                  )}
                  {p.stars != null && p.stars > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3" /> {p.stars}
                    </span>
                  )}
                  {p.forks != null && p.forks > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <GitFork className="h-3 w-3" /> {p.forks}
                    </span>
                  )}
                </div>
                {p.technologies && p.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.technologies.map((t, i) => (
                      <span key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => toggleFeatured(p)}>
                  {p.isFeatured ? "Unfeature" : "Feature"}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href={`/admin/opensource/${p.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-destructive"
                  onClick={() => deleteProject(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
