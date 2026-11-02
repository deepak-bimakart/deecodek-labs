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

export function TestimonialForm({
  mode,
  testimonialId,
  initial,
}: {
  mode: "create" | "edit";
  testimonialId?: string;
  initial?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [authorRole, setAuthorRole] = useState(initial?.authorRole ?? "");
  const [authorCompany, setAuthorCompany] = useState(initial?.authorCompany ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "PUBLISHED");

  async function save() {
    if (!authorName.trim() || !content.trim()) {
      toast.error("Name and quote are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        authorName: authorName.trim(),
        authorRole: authorRole.trim() || undefined,
        authorCompany: authorCompany.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        content: content.trim(),
        rating,
        isFeatured,
        sortOrder,
        status,
      };
      const res = await fetch(
        mode === "create" ? "/api/admin/testimonials" : `/api/admin/testimonials/${testimonialId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed");
      await res.json();
      toast.success(mode === "create" ? "Testimonial created" : "Testimonial updated");
      router.push("/admin/testimonials");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl space-y-4 p-6">
      <div className="space-y-1.5">
        <Label>Author name *</Label>
        <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input value={authorCompany} onChange={(e) => setAuthorCompany(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Avatar URL</Label>
        <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="space-y-1.5">
        <Label>Quote *</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[120px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Rating</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Math.min(5, Math.max(1, parseInt(e.target.value) || 5)))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sort order</Label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label htmlFor="featured">Featured</Label>
        <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => router.push("/admin/testimonials")}>
          Cancel
        </Button>
        <Button onClick={save} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === "create" ? "Create" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
