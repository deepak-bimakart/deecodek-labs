"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Send, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StringListEditor } from "@/components/admin/string-list-editor";
import {
  EntitySeoFields,
  seoFromInitial,
  seoPayload,
  type EntitySeoState,
} from "@/components/admin/entity-seo-fields";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

type Feature = {
  id?: string;
  title: string;
  description?: string;
  sortOrder: number;
};

export function ProductForm({
  mode,
  productId,
  initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [richContent, setRichContent] = useState(initial?.richContent ?? "");
  const [status, setStatus] = useState(initial?.status ?? "in_development");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [technologies, setTechnologies] = useState<string[]>(() => {
    try { return JSON.parse(initial?.technologies ?? "[]"); } catch { return []; }
  });
  const [features, setFeatures] = useState<Feature[]>(() => {
    if (initial?.features) {
      return initial.features.map((f: any, i: number) => ({
        id: f.id,
        title: f.title,
        description: f.description ?? "",
        sortOrder: f.sortOrder ?? i,
      }));
    }
    return [{ title: "", description: "", sortOrder: 0 }];
  });
  const [seo, setSeo] = useState<EntitySeoState>(() => seoFromInitial(initial?.seo));

  useEffect(() => {
    if (mode === "edit" && initial) {
      setName(initial.name);
      setSlug(initial.slug);
      setTagline(initial.tagline ?? "");
      setCategory(initial.category ?? "");
      setSummary(initial.summary ?? "");
      setDescription(initial.description ?? "");
      setRichContent(initial.richContent ?? "");
      setStatus(initial.status ?? "in_development");
      setCoverImage(initial.coverImage ?? "");
      setExternalUrl(initial.externalUrl ?? "");
      setIsFeatured(initial.isFeatured);
      setSortOrder(initial.sortOrder ?? 0);
      try { setTechnologies(JSON.parse(initial.technologies ?? "[]")); } catch {}
      if (initial.features) {
        setFeatures(initial.features.map((f: any, i: number) => ({
          id: f.id, title: f.title, description: f.description ?? "", sortOrder: f.sortOrder ?? i,
        })));
      }
      setSeo(seoFromInitial(initial.seo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  function onNameChange(v: string) {
    setName(v);
    if (mode === "create" && (!slug || slug === slugify(name))) {
      setSlug(slugify(v));
    }
  }

  async function save(targetStatus?: string) {
    setLoading(true);
    setPublishing(targetStatus === "PUBLISHED");
    try {
      const payload = {
        name, slug, tagline, category, summary, description, richContent,
        status, coverImage, externalUrl, isFeatured, sortOrder,
        technologies,
        features: features.filter((f) => f.title.trim() !== ""),
        seo: seoPayload(seo),
      };
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      toast.success("Product saved");
      if (mode === "create") {
        router.push("/admin/products");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setLoading(false);
      setPublishing(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One-liner, can be in any language" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Marketing Technology" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[60px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px]" />
        </div>

        {/* Features editor */}
        <div className="space-y-2">
          <Label>Features</Label>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="rounded-md border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Feature {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input
                  value={f.title}
                  onChange={(e) => {
                    const next = [...features];
                    next[i] = { ...next[i], title: e.target.value, sortOrder: i };
                    setFeatures(next);
                  }}
                  placeholder="Feature title"
                />
                <Textarea
                  value={f.description ?? ""}
                  onChange={(e) => {
                    const next = [...features];
                    next[i] = { ...next[i], description: e.target.value };
                    setFeatures(next);
                  }}
                  placeholder="Description (optional)"
                  className="min-h-[40px]"
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeatures([...features, { title: "", description: "", sortOrder: features.length }])}
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> Add feature
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Technologies</Label>
          <StringListEditor items={technologies} onChange={setTechnologies} placeholder="e.g. Next.js" />
        </div>

        <EntitySeoFields value={seo} onChange={setSeo} entityType="product" />
      </Card>

      <div className="space-y-4">
        <Card className="space-y-4 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Properties</p>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
                <SelectItem value="in_development">In Development</SelectItem>
                <SelectItem value="launched">Live</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured</Label>
            <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ext">External URL</Label>
            <Input id="ext" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." />
          </div>
        </Card>

        <Button onClick={() => save()} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
