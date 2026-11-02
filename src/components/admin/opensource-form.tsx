"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

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
  symbol?: string;
  filterCat?: string;
};

export function OpenSourceForm({
  mode,
  projectId,
  initial,
  allProjects = [],
}: {
  mode: "create" | "edit";
  projectId?: string;
  initial?: Partial<OSSProject>;
  allProjects?: OSSProject[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [repoUrl, setRepoUrl] = useState(initial?.repoUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(initial?.demoUrl ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [filterCat, setFilterCat] = useState(initial?.filterCat ?? "developer");
  const [techInput, setTechInput] = useState((initial?.technologies ?? []).join(", "));
  const [stars, setStars] = useState(initial?.stars ?? 0);
  const [forks, setForks] = useState(initial?.forks ?? 0);
  const [isFeatured, setIsFeatured] = useState(!!initial?.isFeatured);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [symbol, setSymbol] = useState(initial?.symbol ?? "⚙");

  async function save() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const technologies = techInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (mode === "create") {
        const res = await fetch("/api/admin/opensource", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug: slug || slugify(name),
            description,
            repoUrl,
            demoUrl,
            category,
            technologies,
            stars,
            forks,
            isFeatured,
            status,
            sortOrder: allProjects.length,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed");
        }
        const { project } = await res.json();
        const withExtras = { ...project, filterCat, symbol };
        let next = [...allProjects, withExtras];
        if (isFeatured) {
          next = next.map((p) => (p.id === withExtras.id ? p : { ...p, isFeatured: false }));
        }
        await fetch("/api/admin/opensource", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projects: next }),
        });
        toast.success(`Added "${project.name}"`);
        router.push("/admin/opensource");
      } else {
        const updated: OSSProject = {
          ...(initial as OSSProject),
          id: projectId!,
          name,
          slug: slug || slugify(name),
          description,
          repoUrl,
          demoUrl,
          category,
          filterCat,
          technologies,
          stars,
          forks,
          isFeatured,
          status,
          symbol,
        };
        let next = allProjects.map((p) => (p.id === projectId ? updated : p));
        if (isFeatured) {
          next = next.map((p) => (p.id === updated.id ? p : { ...p, isFeatured: false }));
        }
        const res = await fetch("/api/admin/opensource", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projects: next }),
        });
        if (!res.ok) throw new Error("Failed");
        toast.success(`Updated "${updated.name}"`);
        router.push("/admin/opensource");
      }
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl space-y-4 p-6">
      <div className="space-y-1.5">
        <Label>Project name *</Label>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (mode === "create" && (!slug || slug === slugify(name))) {
              setSlug(slugify(e.target.value));
            }
          }}
          placeholder="e.g. Ext Forge"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Slug *</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label>Symbol</Label>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={4} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>GitHub repo URL</Label>
          <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Demo URL</Label>
          <Input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Display category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. DEVELOPER TOOL" />
        </div>
        <div className="space-y-1.5">
          <Label>Filter group</Label>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="developer">Developer tools</SelectItem>
              <SelectItem value="experiments">Experiments</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="wip">Work in Progress</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Technologies (comma-separated)</Label>
          <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>GitHub stars</Label>
          <Input type="number" value={stars} onChange={(e) => setStars(parseInt(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <Label>Forks</Label>
          <Input type="number" value={forks} onChange={(e) => setForks(parseInt(e.target.value) || 0)} />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label htmlFor="featured">Featured project</Label>
        <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => router.push("/admin/opensource")}>
          Cancel
        </Button>
        <Button onClick={save} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === "create" ? "Add project" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
