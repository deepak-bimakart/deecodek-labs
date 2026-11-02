"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type MediaItem = {
  id: string;
  originalName: string;
  mimeType: string;
  url: string;
  altText: string | null;
  description: string | null;
};

export function MediaEditForm({ asset }: { asset: MediaItem }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [editAlt, setEditAlt] = useState(asset.altText ?? "");
  const [editDesc, setEditDesc] = useState(asset.description ?? "");
  const [editName, setEditName] = useState(asset.originalName);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: editAlt,
          description: editDesc,
          originalName: editName,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Saved");
      router.push("/admin/media");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-xl space-y-4 p-6">
      {asset.mimeType.startsWith("image/") && (
        <div className="rounded-md border border-border bg-muted p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.url} alt={editAlt || asset.originalName} className="mx-auto max-h-48" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Filename</Label>
        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Alt text</Label>
        <Input
          value={editAlt}
          onChange={(e) => setEditAlt(e.target.value)}
          placeholder="Describe the image for screen readers"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Internal notes"
        />
      </div>
      <div className="rounded-md bg-muted p-2 font-mono text-xs text-muted-foreground break-all">
        URL: {asset.url}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/media")}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </div>
    </Card>
  );
}
