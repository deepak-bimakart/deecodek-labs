"use client";

import { useState } from "react";
import { FolderOpen, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
};

export function MediaPickerInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMedia(data.media ?? []);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Image URL or pick from media library"
        className="flex-1"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (v) loadMedia();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <FolderOpen className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pick from media library</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : media.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No media uploaded yet. Upload some in the Media Library first.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {media
                .filter((m) => m.mimeType.startsWith("image/"))
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onChange(m.url);
                      setOpen(false);
                    }}
                    className="group overflow-hidden rounded-md border border-border text-left transition-all hover:border-primary"
                  >
                    <div className="aspect-square bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.originalName} className="h-full w-full object-cover" />
                    </div>
                    <p className="truncate p-2 text-[10px] text-muted-foreground">
                      {m.originalName}
                    </p>
                  </button>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
