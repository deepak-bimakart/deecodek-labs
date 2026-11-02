import Link from "next/link";
import { Plus, Quote } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminEntityList } from "@/components/admin/admin-entity-list";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">{testimonials.length} quotes</p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/new">
            <Plus className="mr-2 h-4 w-4" /> New testimonial
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <AdminEntityList
          emptyIcon={Quote}
          emptyText="No testimonials yet."
          deleteUrl={(id) => `/api/admin/testimonials/${id}`}
          rows={testimonials.map((t) => ({
            id: t.id,
            title: t.authorName,
            href: `/admin/testimonials/${t.id}`,
            summary: t.content,
            meta: [t.authorRole, t.authorCompany].filter(Boolean).join(" · ") || undefined,
            status: t.status,
            isFeatured: t.isFeatured,
          }))}
        />
      </Card>
    </div>
  );
}
