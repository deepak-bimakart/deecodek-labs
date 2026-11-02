"use client";

import { useState } from "react";
import { Save, Loader2, Trash2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type SeoRecord = {
  id: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  updatedAt: Date;
  pages: { id: string; title: string; slug: string }[];
  services: { id: string; title: string; slug: string }[];
  products: { id: string; name: string; slug: string }[];
  projects: { id: string; name: string; slug: string }[];
  posts: { id: string; title: string; slug: string }[];
};

type Redirect = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
};

function attachedSummary(record: SeoRecord): string {
  const all = [
    ...record.pages.map((p) => `page: ${p.title}`),
    ...record.services.map((s) => `service: ${s.title}`),
    ...record.products.map((p) => `product: ${p.name}`),
    ...record.projects.map((p) => `project: ${p.name}`),
    ...record.posts.map((p) => `post: ${p.title}`),
  ];
  return all.length === 0 ? "Unattached" : all.join(", ");
}

export function SeoManager({
  initialRecords,
  initialRedirects,
}: {
  initialRecords: SeoRecord[];
  initialRedirects: Redirect[];
}) {
  const [records, setRecords] = useState<SeoRecord[]>(initialRecords);
  const [redirects] = useState<Redirect[]>(initialRedirects);
  const [expandedId, setExpandedId] = useState<string | null>(initialRecords[0]?.id ?? null);
  const [saving, setSaving] = useState<string | null>(null);

  async function updateRecord(id: string, patch: Partial<SeoRecord>) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  async function saveRecord(id: string) {
    setSaving(id);
    const record = records.find((r) => r.id === id);
    if (!record) return;
    try {
      const res = await fetch(`/api/admin/seo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaTitle: record.metaTitle ?? "",
          metaDescription: record.metaDescription ?? "",
          canonicalUrl: record.canonicalUrl ?? "",
          ogTitle: record.ogTitle ?? "",
          ogDescription: record.ogDescription ?? "",
          ogImage: record.ogImage ?? "",
          robotsIndex: record.robotsIndex,
          robotsFollow: record.robotsFollow,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("SEO saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  }

  async function deleteRecord(id: string) {
    if (!confirm("Delete this SEO record?")) return;
    try {
      const res = await fetch(`/api/admin/seo/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  }

  const expanded = records.find((r) => r.id === expandedId);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            SEO records ({records.length})
          </p>
        </div>
        <div className="divide-y divide-border">
          {records.map((record) => (
            <button
              key={record.id}
              onClick={() => setExpandedId(record.id === expandedId ? null : record.id)}
              className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/20"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {record.metaTitle || "(no title)"}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {attachedSummary(record)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {record.robotsIndex && (
                  <Badge variant="outline" className="text-[10px]">index</Badge>
                )}
                {!record.robotsIndex && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">noindex</Badge>
                )}
                {record.robotsFollow && (
                  <Badge variant="outline" className="text-[10px]">follow</Badge>
                )}
              </div>
            </button>
          ))}
          {records.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No SEO records yet. They&apos;ll appear here when content has SEO attached.
            </div>
          )}
        </div>
      </Card>

      {expanded && (
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="font-medium">Edit SEO</p>
              <p className="text-xs text-muted-foreground">{attachedSummary(expanded)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => deleteRecord(expanded.id)}>
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </Button>
              <Button size="sm" onClick={() => saveRecord(expanded.id)} disabled={saving === expanded.id}>
                {saving === expanded.id ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3.5 w-3.5" /> Save
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Meta title</Label>
              <Input
                value={expanded.metaTitle ?? ""}
                onChange={(e) => updateRecord(expanded.id, { metaTitle: e.target.value })}
                placeholder="60 chars max"
                maxLength={70}
              />
              <p className="text-[10px] text-muted-foreground">{(expanded.metaTitle ?? "").length}/70</p>
            </div>
            <div className="space-y-1.5">
              <Label>Canonical URL</Label>
              <Input
                value={expanded.canonicalUrl ?? ""}
                onChange={(e) => updateRecord(expanded.id, { canonicalUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Meta description</Label>
            <Textarea
              value={expanded.metaDescription ?? ""}
              onChange={(e) => updateRecord(expanded.id, { metaDescription: e.target.value })}
              placeholder="160 chars max"
              maxLength={170}
              className="min-h-[60px]"
            />
            <p className="text-[10px] text-muted-foreground">{(expanded.metaDescription ?? "").length}/170</p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">OpenGraph</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>OG title</Label>
              <Input
                value={expanded.ogTitle ?? ""}
                onChange={(e) => updateRecord(expanded.id, { ogTitle: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>OG image URL</Label>
              <Input
                value={expanded.ogImage ?? ""}
                onChange={(e) => updateRecord(expanded.id, { ogImage: e.target.value })}
                placeholder="/uploads/..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>OG description</Label>
            <Textarea
              value={expanded.ogDescription ?? ""}
              onChange={(e) => updateRecord(expanded.id, { ogDescription: e.target.value })}
              className="min-h-[60px]"
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Robots</p>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="index"
                checked={expanded.robotsIndex}
                onCheckedChange={(v) => updateRecord(expanded.id, { robotsIndex: v })}
              />
              <Label htmlFor="index">Allow indexing</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="follow"
                checked={expanded.robotsFollow}
                onCheckedChange={(v) => updateRecord(expanded.id, { robotsFollow: v })}
              />
              <Label htmlFor="follow">Follow links</Label>
            </div>
          </div>
        </Card>
      )}

      {/* Redirects */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Redirects ({redirects.length})
          </p>
          <Button asChild size="sm" variant="outline">
            <a href="/admin/redirects">Manage redirects</a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Redirects are managed under{" "}
          <a href="/admin/redirects" className="text-primary hover:underline">
            /admin/redirects
          </a>
          . Active rules are applied by middleware at request time.
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View sitemap.xml
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View robots.txt
          </a>
        </div>
      </Card>
    </div>
  );
}
