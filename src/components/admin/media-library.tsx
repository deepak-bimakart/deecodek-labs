"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Upload, Trash2, Copy, Loader2, ImageIcon, FileText, Search, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type MediaItem = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  description: string | null;
  url: string;
  uploadedBy: { name: string | null; email: string } | null;
  createdAt: Date;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaLibrary({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filtered = media.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.originalName.toLowerCase().includes(q) ||
      m.altText?.toLowerCase().includes(q) ||
      m.mimeType.toLowerCase().includes(q)
    );
  });

  const upload = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const arr = Array.from(files);
      if (arr.length === 0) return;
      for (const f of arr) formData.append("files", f);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const { media: newMedia } = await res.json();
      setMedia((prev) => [...newMedia, ...prev]);
      toast.success(`Uploaded ${newMedia.length} file(s)`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) upload(e.dataTransfer.files);
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success("URL copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function deleteMedia(item: MediaItem) {
    if (!confirm(`Delete "${item.originalName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setMedia((prev) => prev.filter((m) => m.id !== item.id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.svg"
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Drag &amp; drop files here</p>
            <p className="text-xs text-muted-foreground">or</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-3.5 w-3.5" /> Browse files
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Allowed: JPEG, PNG, WebP, GIF, SVG, PDF · max 10MB
            </p>
          </>
        )}
      </Card>

      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search by name, alt text, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-xs text-muted-foreground">{filtered.length} of {media.length}</span>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {media.length === 0 ? "No media uploaded yet." : "No matches."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => {
            const isImage = item.mimeType.startsWith("image/");
            return (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.altText ?? item.originalName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <span className="text-xs">{item.mimeType}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Edit">
                      <Link href={`/admin/media/${item.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyUrl(item)} title="Copy URL">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => deleteMedia(item)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Link
                    href={`/admin/media/${item.id}`}
                    className="truncate text-xs font-medium hover:underline block"
                    title={item.originalName}
                  >
                    {item.originalName}
                  </Link>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatBytes(item.size)}
                    </span>
                    {item.width && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {item.width}×{item.height}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
