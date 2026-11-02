"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentType } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  title: string;
  href: string;
  summary?: string | null;
  meta?: string;
  status: string;
  statusTone?: string;
  isFeatured?: boolean;
};

export function AdminEntityList({
  rows: initial,
  deleteUrl,
  emptyIcon: EmptyIcon,
  emptyText,
}: {
  rows: Row[];
  deleteUrl: (id: string) => string;
  emptyIcon?: ComponentType<{ className?: string }>;
  emptyText?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function onDelete(row: Row) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    setDeletingId(row.id);
    try {
      const res = await fetch(deleteUrl(row.id), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="p-12 text-center">
        {EmptyIcon && <EmptyIcon className="mx-auto h-8 w-8 text-muted-foreground" />}
        <p className="mt-3 text-sm text-muted-foreground">{emptyText ?? "Nothing here yet."}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-4 p-4 hover:bg-muted/20">
          <Link href={row.href} className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{row.title}</p>
              {row.isFeatured && <Badge variant="outline" className="text-[10px]">Featured</Badge>}
            </div>
            {row.summary && (
              <p className="truncate text-sm text-muted-foreground">{row.summary}</p>
            )}
            {row.meta && (
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{row.meta}</p>
            )}
          </Link>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${row.statusTone ?? "bg-muted text-muted-foreground"}`}>
            {row.status.replace(/_/g, " ")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 hover:text-destructive"
            onClick={() => onDelete(row)}
            disabled={deletingId === row.id}
          >
            {deletingId === row.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
