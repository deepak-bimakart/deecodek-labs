import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminEntityList } from "@/components/admin/admin-entity-list";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, string> = {
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PUBLISHED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  ARCHIVED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export default async function AdminPortfolioPage() {
  const projects = await db.project.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} projects. Never fabricate case studies or metrics.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/portfolio/new">
            <Plus className="mr-2 h-4 w-4" /> New project
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <AdminEntityList
          emptyIcon={FolderKanban}
          emptyText="No projects yet. Don't fabricate — add real ones only."
          deleteUrl={(id) => `/api/admin/projects/${id}`}
          rows={projects.map((p) => ({
            id: p.id,
            title: p.name,
            href: `/admin/portfolio/${p.id}`,
            summary: p.summary ?? "No summary",
            meta: `/${p.slug} · ${p.category ?? "uncategorized"}`,
            status: p.status,
            statusTone: STATUS_TONES[p.status] ?? STATUS_TONES.DRAFT,
            isFeatured: p.isFeatured,
          }))}
        />
      </Card>
    </div>
  );
}
