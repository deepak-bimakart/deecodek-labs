import Link from "next/link";
import { Plus, Boxes } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminEntityList } from "@/components/admin/admin-entity-list";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, string> = {
  coming_soon: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  in_development: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  launched: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  archived: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { features: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} products · MarketFlow, Sadika seeded
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <AdminEntityList
          emptyIcon={Boxes}
          emptyText="No products yet."
          deleteUrl={(id) => `/api/admin/products/${id}`}
          rows={products.map((p) => ({
            id: p.id,
            title: p.name,
            href: `/admin/products/${p.id}`,
            summary: p.tagline ?? p.summary ?? "No description",
            meta: `/${p.slug} · ${p._count.features} features`,
            status: p.status,
            statusTone: STATUS_TONES[p.status] ?? STATUS_TONES.in_development,
            isFeatured: p.isFeatured,
          }))}
        />
      </Card>
    </div>
  );
}
