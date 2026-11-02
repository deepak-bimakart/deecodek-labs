import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PagesList } from "@/components/admin/pages-list";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await db.page.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      sections: { select: { id: true, sectionType: true } },
      updatedBy: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all pages on your site. Edit sections, reorder, draft, publish.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="mr-2 h-4 w-4" /> New page
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>{pages.length} pages total</span>
          </div>
        </div>
        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No pages yet.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/pages/new">
                <Plus className="mr-2 h-4 w-4" /> Create your first page
              </Link>
            </Button>
          </div>
        ) : (
          <PagesList pages={pages} />
        )}
      </Card>
    </div>
  );
}
