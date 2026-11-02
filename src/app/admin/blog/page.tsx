import Link from "next/link";
import { Plus, Newspaper } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminEntityList } from "@/components/admin/admin-entity-list";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, string> = {
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  IN_REVIEW: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  PUBLISHED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  SCHEDULED: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  ARCHIVED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      author: { select: { name: true, email: true } },
    },
  });

  const categories = await db.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
  });
  const tags = await db.blogTag.findMany({
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">{posts.length} posts</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" /> New post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Categories ({categories.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Badge key={c.id} variant="outline" className="text-[11px]">
                {c.name} ({c._count.posts})
              </Badge>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Tags ({tags.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge key={t.id} variant="outline" className="text-[11px] font-mono">
                #{t.name} ({t._count.posts})
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <AdminEntityList
          emptyIcon={Newspaper}
          emptyText="No posts yet."
          deleteUrl={(id) => `/api/admin/blog/${id}`}
          rows={posts.map((p) => ({
            id: p.id,
            title: p.title,
            href: `/admin/blog/${p.id}`,
            summary: p.excerpt,
            meta: [
              `/${p.slug}`,
              p.category?.name,
              p.author ? `by ${p.author.name ?? p.author.email}` : null,
              p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : null,
            ]
              .filter(Boolean)
              .join(" · "),
            status: p.status,
            statusTone: STATUS_TONES[p.status] ?? STATUS_TONES.DRAFT,
            isFeatured: p.featured,
          }))}
        />
      </Card>
    </div>
  );
}
