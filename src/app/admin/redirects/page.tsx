import { db } from "@/lib/db";
import { RedirectsManager } from "@/components/admin/redirects-manager";

export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  const redirects = await db.redirect.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Redirects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active redirects are applied by middleware for public paths (cached ~30s).
        </p>
      </div>
      <RedirectsManager initialRedirects={redirects} />
    </div>
  );
}
