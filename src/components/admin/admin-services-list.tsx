"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Icons from "lucide-react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Service = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  icon: string | null;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
};

const STATUS_TONES: Record<string, string> = {
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  IN_REVIEW: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  PUBLISHED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  SCHEDULED: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  ARCHIVED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export function AdminServicesList({ services: initial }: { services: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteService(s: Service) {
    if (!confirm(`Delete "${s.title}"?`)) return;
    setDeletingId(s.id);
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setServices((prev) => prev.filter((x) => x.id !== s.id));
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="divide-y divide-border">
      {services.map((s) => {
        const lib = Icons as any;
        const Icon = lib[s.icon ?? "Sparkles"] ?? Icons.Sparkles;
        return (
          <div key={s.id} className="flex items-center gap-4 p-4 hover:bg-muted/20">
            <Link href={`/admin/services/${s.id}`} className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{s.title}</p>
                  {s.isFeatured && <Badge variant="outline" className="text-[10px]">Featured</Badge>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{s.summary}</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONES[s.status] ?? STATUS_TONES.DRAFT}`}>
                {s.status.replace("_", " ")}
              </span>
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:text-destructive"
              onClick={() => deleteService(s)}
              disabled={deletingId === s.id}
            >
              {deletingId === s.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
