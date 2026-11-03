"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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

export function ProjectForm({
  mode,
  projectId,
  initial,
}: {
  mode: "create" | "edit";
  projectId?: string;
  initial?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [caseStudy, setCaseStudy] = useState(initial?.caseStudy ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [projectUrl, setProjectUrl] = useState(initial?.projectUrl ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [completionDate, setCompletionDate] = useState<string>(
    initial?.completionDate ? new Date(initial.completionDate).toISOString().split("T")[0] : ""
  );
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [technologies, setTechnologies] = useState<string[]>(() => {
    try { return JSON.parse(initial?.technologies ?? "[]"); } catch { return []; }
  });
  const [gallery, setGallery] = useState<string[]>(() => {
    try { return JSON.parse(initial?.gallery ?? "[]"); } catch { return []; }
  });
  const [seo, setSeo] = useState<EntitySeoState>(() => seoFromInitial(initial?.seo));

  useEffect(() => {
    if (mode === "edit" && initial) {
      setName(initial.name);
      setSlug(initial.slug);
      setCategory(initial.category ?? "");
      setSummary(initial.summary ?? "");
      setDescription(initial.description ?? "");
      setCaseStudy(initial.caseStudy ?? "");
      setCoverImage(initial.coverImage ?? "");
      setProjectUrl(initial.projectUrl ?? "");
      setIsFeatured(initial.isFeatured);
      setCompletionDate(initial.completionDate ? new Date(initial.completionDate).toISOString().split("T")[0] : "");
      setStatus(initial.status ?? "DRAFT");
      try { setTechnologies(JSON.parse(initial.technologies ?? "[]")); } catch {}
      try { setGallery(JSON.parse(initial.gallery ?? "[]")); } catch {}
      setSeo(seoFromInitial(initial.seo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function onNameChange(v: string) {
    setName(v);
    if (mode === "create" && (!slug || slug === slugify(name))) {
      setSlug(slugify(v));
    }
  }

  async function save() {
    setLoading(true);
    try {
      const payload = {
        name, slug, category, summary, description, caseStudy,
        coverImage, projectUrl, isFeatured,
        completionDate: completionDate || null,
        status, technologies, gallery,
        seo: seoPayload(seo),
      };
      const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${projectId}`;
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
      toast.success("Project saved");
      if (mode === "create") {
        router.push("/admin/portfolio");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Project name *</Label>
          <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. SaaS, Fintech, Healthcare" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[60px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="case">Case study (markdown)</Label>
          <Textarea id="case" value={caseStudy} onChange={(e) => setCaseStudy(e.target.value)} className="min-h-[200px] font-mono text-sm" placeholder="## Challenge&#10;&#10;## Solution&#10;&#10;## Results (use real numbers only)" />
          <p className="text-xs text-muted-foreground">Never fabricate metrics. Only include numbers you can defend.</p>
        </div>
        <div className="space-y-2">
          <Label>Technologies</Label>
          <StringListEditor items={technologies} onChange={setTechnologies} placeholder="e.g. Next.js" />
        </div>
        <div className="space-y-2">
          <Label>Gallery image URLs</Label>
          <StringListEditor items={gallery} onChange={setGallery} placeholder="/uploads/..." />
        </div>

        <EntitySeoFields value={seo} onChange={setSeo} entityType="project" />
      </Card>

      <div className="space-y-4">
        <Card className="space-y-4 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Properties</p>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured</Label>
            <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="completed">Completion date</Label>
            <Input id="completed" type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Project URL</Label>
            <Input id="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Cover image URL</Label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/uploads/..." />
          </div>
        </Card>
        <Button onClick={save} disabled={loading} className="w-full">
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
