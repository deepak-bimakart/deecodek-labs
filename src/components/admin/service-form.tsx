"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Send } from "lucide-react";
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

const ICON_OPTIONS = [
  "Server", "Globe", "Smartphone", "Bot", "Boxes", "Plug",
  "Code", "Database", "Cloud", "Cpu", "Layers", "Wrench",
  "Zap", "Rocket", "Brain", "Workflow", "GitBranch", "Terminal",
];

export function ServiceForm({
  mode,
  serviceId,
  initial,
}: {
  mode: "create" | "edit";
  serviceId?: string;
  initial?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [richContent, setRichContent] = useState(initial?.richContent ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "Server");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [technologies, setTechnologies] = useState<string[]>(() => {
    try { return JSON.parse(initial?.technologies ?? "[]"); } catch { return []; }
  });
  const [capabilities, setCapabilities] = useState<string[]>(() => {
    try { return JSON.parse(initial?.capabilities ?? "[]"); } catch { return []; }
  });
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [seo, setSeo] = useState<EntitySeoState>(() => seoFromInitial(initial?.seo));

  useEffect(() => {
    if (mode === "edit" && initial) {
      setTitle(initial.title);
      setSlug(initial.slug);
      setSummary(initial.summary ?? "");
      setDescription(initial.description ?? "");
      setRichContent(initial.richContent ?? "");
      setIcon(initial.icon ?? "Server");
      setImageUrl(initial.imageUrl ?? "");
      try { setTechnologies(JSON.parse(initial.technologies ?? "[]")); } catch {}
      try { setCapabilities(JSON.parse(initial.capabilities ?? "[]")); } catch {}
      setIsFeatured(initial.isFeatured);
      setSortOrder(initial.sortOrder);
      setStatus(initial.status);
      setSeo(seoFromInitial(initial.seo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  function onTitleChange(v: string) {
    setTitle(v);
    if (mode === "create" && (!slug || slug === slugify(title))) {
      setSlug(slugify(v));
    }
  }

  async function save(targetStatus?: string) {
    setLoading(targetStatus === undefined);
    setPublishing(targetStatus === "PUBLISHED");
    try {
      const payload = {
        title, slug, summary, description, richContent, icon,
        imageUrl, technologies, capabilities, isFeatured, sortOrder,
        status: targetStatus ?? status,
        seo: seoPayload(seo),
      };
      const url = mode === "create" ? "/api/admin/services" : `/api/admin/services/${serviceId}`;
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
      if (targetStatus === "PUBLISHED") {
        toast.success("Service published!");
      } else {
        toast.success("Service saved");
      }
      if (mode === "create") {
        router.push("/admin/services");
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
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[60px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rich">Rich content (markdown)</Label>
          <Textarea id="rich" value={richContent} onChange={(e) => setRichContent(e.target.value)} className="min-h-[150px] font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <Label>Technologies</Label>
          <StringListEditor items={technologies} onChange={setTechnologies} placeholder="e.g. Next.js" />
        </div>
        <div className="space-y-2">
          <Label>Capabilities</Label>
          <StringListEditor items={capabilities} onChange={setCapabilities} placeholder="e.g. Modular architecture" multiline />
        </div>

        <EntitySeoFields value={seo} onChange={setSeo} entityType="service" />
      </Card>

      <div className="space-y-4">
        <Card className="space-y-4 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Properties</p>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((ic) => (
                  <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
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
        </Card>

        <div className="flex flex-col gap-2">
          <Button onClick={() => save()} disabled={loading}>
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
          <Button onClick={() => save("PUBLISHED")} disabled={publishing} variant="secondary">
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Save & Publish
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
