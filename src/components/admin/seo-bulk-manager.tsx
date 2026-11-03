"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type BulkSeoRow = {
  entityType: "page" | "post";
  entityId: string;
  title: string;
  slug: string;
  status: string;
  path: string;
  seoId: string | null;
  metaTitle: string;
  metaDescription: string;
  seoScore: number | null;
  focusKeyword: string;
};

export function SeoBulkManager({ initialRows }: { initialRows: BulkSeoRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function keyOf(r: BulkSeoRow) {
    return `${r.entityType}:${r.entityId}`;
  }

  function patchRow(k: string, patch: Partial<BulkSeoRow>) {
    setRows((prev) => prev.map((r) => (keyOf(r) === k ? { ...r, ...patch } : r)));
  }

  async function saveRow(row: BulkSeoRow) {
    const k = keyOf(row);
    setSavingKey(k);
    try {
      const res = await fetch("/api/admin/seo/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: row.entityType,
          entityId: row.entityId,
          metaTitle: row.metaTitle || null,
          metaDescription: row.metaDescription || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Saved ${row.title}`);
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Entity</th>
            <th className="px-3 py-2">Meta title</th>
            <th className="px-3 py-2">Meta description</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const k = keyOf(row);
            return (
              <tr key={k} className="border-b border-border align-top last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium">{row.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{row.path}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    {row.entityType} · {row.status}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Input
                    className="h-8 text-xs"
                    value={row.metaTitle}
                    onChange={(e) => patchRow(k, { metaTitle: e.target.value })}
                  />
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {row.metaTitle.length}/60
                  </p>
                </td>
                <td className="px-3 py-2">
                  <Input
                    className="h-8 text-xs"
                    value={row.metaDescription}
                    onChange={(e) => patchRow(k, { metaDescription: e.target.value })}
                  />
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {row.metaDescription.length}/160
                  </p>
                </td>
                <td className="px-3 py-2 tabular-nums text-xs text-muted-foreground">
                  {row.seoScore ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={savingKey === k}
                    onClick={() => saveRow(row)}
                  >
                    {savingKey === k ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Save className="mr-1 h-3.5 w-3.5" /> Save
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
