import Link from "next/link";
import { Plus, HelpCircle } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminEntityList } from "@/components/admin/admin-entity-list";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await db.faq.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">FAQs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{faqs.length} questions</p>
        </div>
        <Button asChild>
          <Link href="/admin/faqs/new">
            <Plus className="mr-2 h-4 w-4" /> New FAQ
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <AdminEntityList
          emptyIcon={HelpCircle}
          emptyText="No FAQs yet."
          deleteUrl={(id) => `/api/admin/faqs/${id}`}
          rows={faqs.map((f) => ({
            id: f.id,
            title: f.question,
            href: `/admin/faqs/${f.id}`,
            summary: f.answer,
            meta: f.category ? `category: ${f.category}` : undefined,
            status: f.status,
          }))}
        />
      </Card>
    </div>
  );
}
