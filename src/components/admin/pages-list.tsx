"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  pageType: string;
  isHomepage: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  updatedBy: { name: string | null; email: string } | null;
  sections: { id: string; sectionType: string }[];
};

const STATUS_TONES: Record<string, string> = {
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  IN_REVIEW: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  PUBLISHED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  SCHEDULED: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  ARCHIVED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export function PagesList({ pages: initial }: { pages: PageRow[] }) {
  const router = useRouter();
  const [pages, setPages] = useState(initial);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [pages, search]);

  async function deletePage(page: PageRow) {
    if (page.isHomepage) {
      toast.error("Cannot delete the homepage");
      return;
    }
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setDeletingId(page.id);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast.success("Page deleted");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="border-b border-border p-3">
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Sections</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Updated</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((page) => (
              <tr key={page.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {page.title}
                    {page.isHomepage && (
                      <Badge variant="outline" className="ml-2 text-[10px]">Homepage</Badge>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">/{page.slug}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONES[page.status] ?? STATUS_TONES.DRAFT}`}>
                    {page.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{page.sections.length}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(page.updatedAt).toLocaleDateString()}
                  {page.updatedBy?.name && (
                    <div className="font-mono text-[10px]">by {page.updatedBy.name}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        {deletingId === page.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/pages/${page.id}`}>
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={
                            page.isHomepage || page.slug === "home"
                              ? page.status === "PUBLISHED"
                                ? "/"
                                : "/?preview=1"
                              : page.status === "PUBLISHED"
                                ? `/${page.slug}`
                                : `/${page.slug}?preview=1`
                          }
                          target="_blank"
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" /> View
                        </Link>
                      </DropdownMenuItem>
                      {!page.isHomepage && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deletePage(page)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
