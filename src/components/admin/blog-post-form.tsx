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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EntitySeoFields,
  seoFromInitial,
  seoPayload,
  type EntitySeoState,
} from "@/components/admin/entity-seo-fields";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function BlogPostForm({
  mode,
  postId,
  initial,
  categories,
  tags,
}: {
  mode: "create" | "edit";
  postId?: string;
  initial?: any;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [readingMinutes, setReadingMinutes] = useState(initial?.readingMinutes ?? 5);
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => {
    if (initial?.tags) return initial.tags.map((t: any) => t.tagId);
    return [];
  });
  const [seo, setSeo] = useState<EntitySeoState>(() => seoFromInitial(initial?.seo));

  useEffect(() => {
    if (mode === "edit" && initial) {
      setTitle(initial.title);
      setSlug(initial.slug);
      setExcerpt(initial.excerpt ?? "");
      setContent(initial.content ?? "");
      setCoverImage(initial.coverImage ?? "");
      setReadingMinutes(initial.readingMinutes ?? 5);
      setStatus(initial.status ?? "DRAFT");
      setFeatured(initial.featured ?? false);
      setCategoryId(initial.categoryId ?? "");
      if (initial.tags) setSelectedTagIds(initial.tags.map((t: any) => t.tagId));
      setSeo(seoFromInitial(initial.seo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  function onTitleChange(v: string) {
    setTitle(v);
    if (mode === "create" && (!slug || slug === slugify(title))) {
      setSlug(slugify(v));
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function save(targetStatus?: string) {
    setLoading(true);
    setPublishing(targetStatus === "PUBLISHED");
    try {
      const payload = {
        title, slug, excerpt, content, coverImage,
        readingMinutes,
        status: targetStatus ?? status,
        featured,
        categoryId: categoryId || null,
        tagIds: selectedTagIds,
        seo: seoPayload(seo),
      };
      const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${postId}`;
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
      toast.success(targetStatus === "PUBLISHED" ? "Post published!" : "Post saved");
      if (mode === "create") {
        router.push("/admin/blog");
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
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="min-h-[60px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content (markdown)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="# Heading&#10;&#10;Body paragraph..."
          />
        </div>

        <EntitySeoFields value={seo} onChange={setSeo} entityType="blog" />
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
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground">No tags yet.</p>
              ) : (
                tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                      selectedTagIds.includes(t.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    #{t.name}
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Reading time (min)</Label>
            <Input id="minutes" type="number" value={readingMinutes} onChange={(e) => setReadingMinutes(parseInt(e.target.value) || 5)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured</Label>
            <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
          </div>
          <div className="space-y-2">
            <Label>Cover image URL</Label>
            <Input value={coverImage ?? ""} onChange={(e) => setCoverImage(e.target.value)} placeholder="/uploads/..." />
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
