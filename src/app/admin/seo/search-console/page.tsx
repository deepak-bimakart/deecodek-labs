import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGscEnvStatus } from "@/lib/seo-health";

export const dynamic = "force-dynamic";

export default function AdminSearchConsolePage() {
  const gsc = getGscEnvStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Google Search Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placeholder connector for Search Console insights. Wire API credentials via env when ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/seo" className="text-primary hover:underline">
            SEO overview
          </Link>
          <Link href="/admin/settings#seo" className="text-primary hover:underline">
            Verification meta
          </Link>
          <Link href="/admin/settings#analytics" className="text-primary hover:underline">
            Analytics
          </Link>
        </div>
      </div>

      <Card className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="font-display text-base font-semibold">Connection status</h2>
          <Badge variant={gsc.configured ? "default" : "secondary"}>
            {gsc.configured ? "Env detected" : "Not configured"}
          </Badge>
        </div>

        {gsc.configured ? (
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <p className="mono-label mb-1">Site URL</p>
              <p className="font-mono text-xs">{gsc.siteUrl ?? "—"}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="mono-label mb-1">Client email</p>
              <p className="font-mono text-xs">{gsc.clientEmail ?? "—"}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="mono-label mb-1">Private key / credentials</p>
              <p className="text-xs text-muted-foreground">
                {gsc.hasPrivateKey ? "Present (hidden)" : "Missing"}
              </p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="mono-label mb-1">Property ID</p>
              <p className="font-mono text-xs">{gsc.propertyId ?? "—"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Add these environment variables (server-only) to enable a future live GSC pull:
            </p>
            <ul className="list-disc space-y-1 pl-5 font-mono text-xs text-foreground">
              <li>GOOGLE_SEARCH_CONSOLE_SITE_URL</li>
              <li>GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</li>
              <li>GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY</li>
              <li>GOOGLE_SEARCH_CONSOLE_PROPERTY_ID (optional)</li>
            </ul>
            <p>
              Until then, use{" "}
              <Link href="/admin/settings#seo" className="text-primary hover:underline">
                SEO settings
              </Link>{" "}
              for Google / Bing HTML verification tokens, and submit{" "}
              <code className="font-mono text-xs">/sitemap.xml</code> in Search Console manually.
            </p>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              Open Google Search Console <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-base font-semibold">Performance (mock empty state)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clicks, impressions, CTR, and average position will appear here once the API connector is
          implemented.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {["Clicks", "Impressions", "CTR", "Avg. position"].map((label) => (
            <div
              key={label}
              className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center"
            >
              <p className="font-display text-2xl font-semibold text-muted-foreground/50">—</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Query</th>
                <th className="px-3 py-2">Clicks</th>
                <th className="px-3 py-2">Impr.</th>
                <th className="px-3 py-2">CTR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-3 py-10 text-center text-muted-foreground">
                  No Search Console rows yet. Configure env vars above, then reconnect.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
