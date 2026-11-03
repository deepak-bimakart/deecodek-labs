import Link from "next/link";
import { db } from "@/lib/db";
import { Seo404sManager } from "@/components/admin/seo-404s-manager";

export const dynamic = "force-dynamic";

export default async function AdminSeo404sPage() {
  let hits: Array<{
    id: string;
    path: string;
    count: number;
    lastReferrer: string | null;
    updatedAt: Date;
  }> = [];

  try {
    hits = await db.notFoundHit.findMany({
      orderBy: [{ count: "desc" }, { updatedAt: "desc" }],
      take: 200,
    });
  } catch {
    hits = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">404 monitor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paths that hit the not-found page. Create a 301 redirect to reclaim traffic.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/seo" className="text-primary hover:underline">
            SEO overview
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/admin/seo/bulk" className="text-primary hover:underline">
            Bulk editor
          </Link>
        </div>
      </div>
      <Seo404sManager initialHits={hits} />
    </div>
  );
}
