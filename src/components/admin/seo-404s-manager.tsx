"use client";

import { useState } from "react";
import { Loader2, ArrowRightLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Hit = {
  id: string;
  path: string;
  count: number;
  lastReferrer: string | null;
  updatedAt: string | Date;
};

export function Seo404sManager({ initialHits }: { initialHits: Hit[] }) {
  const [hits, setHits] = useState(initialHits);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toPathById, setToPathById] = useState<Record<string, string>>({});

  async function createRedirect(hit: Hit) {
    const toPath = (toPathById[hit.id] || "").trim();
    if (!toPath) {
      toast.error("Enter a destination path");
      return;
    }
    setBusyId(hit.id);
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPath: hit.path,
          toPath: toPath.startsWith("/") || toPath.startsWith("http") ? toPath : `/${toPath}`,
          statusCode: 301,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed");
      }
      toast.success(`Redirect created: ${hit.path}`);
      await fetch(`/api/admin/seo/404s?id=${hit.id}`, { method: "DELETE" });
      setHits((prev) => prev.filter((h) => h.id !== hit.id));
    } catch (e: any) {
      toast.error(e.message || "Failed to create redirect");
    } finally {
      setBusyId(null);
    }
  }

  async function dismiss(hit: Hit) {
    setBusyId(hit.id);
    try {
      const res = await fetch(`/api/admin/seo/404s?id=${hit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setHits((prev) => prev.filter((h) => h.id !== hit.id));
      toast.success("Cleared");
    } catch {
      toast.error("Failed to clear");
    } finally {
      setBusyId(null);
    }
  }

  if (hits.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No 404 hits recorded yet. Hits are logged when visitors land on the not-found page.
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Path</th>
            <th className="px-3 py-2">Hits</th>
            <th className="px-3 py-2">Last referrer</th>
            <th className="px-3 py-2">Redirect to</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {hits.map((hit) => (
            <tr key={hit.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-xs">{hit.path}</td>
              <td className="px-3 py-2 tabular-nums">{hit.count}</td>
              <td className="max-w-[180px] truncate px-3 py-2 text-xs text-muted-foreground">
                {hit.lastReferrer || "—"}
              </td>
              <td className="px-3 py-2">
                <Input
                  className="h-8 font-mono text-xs"
                  placeholder="/new-path"
                  value={toPathById[hit.id] ?? ""}
                  onChange={(e) =>
                    setToPathById((prev) => ({ ...prev, [hit.id]: e.target.value }))
                  }
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyId === hit.id}
                    onClick={() => createRedirect(hit)}
                  >
                    {busyId === hit.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <ArrowRightLeft className="mr-1 h-3.5 w-3.5" /> Redirect
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busyId === hit.id}
                    onClick={() => dismiss(hit)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
