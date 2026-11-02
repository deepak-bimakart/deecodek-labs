import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, string> = {
  NEW: "bg-red-500/15 text-red-700 dark:text-red-400",
  READ: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  IN_PROGRESS: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  REPLIED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CLOSED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  SPAM: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

export default async function AdminContactPage() {
  const submissions = await db.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const counts = await db.contactSubmission.groupBy({
    by: ["status"],
    _count: true,
  });
  const countsMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Contact Submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {submissions.length} total · {countsMap.NEW ?? 0} new
          </p>
        </div>
        <a
          href="/api/admin/contact/export"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </a>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_TONES).map(([status, _]) => (
          <Link
            key={status}
            href={`/admin/contact?status=${status}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1 text-xs hover:bg-muted"
          >
            <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_TONES[status]}`}>
              {status.replace("_", " ")}
            </span>
            <span className="font-mono">{countsMap[status] ?? 0}</span>
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No submissions yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Form submissions from the public site will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {submissions.map((s) => (
              <Link
                key={s.id}
                href={`/admin/contact/${s.id}`}
                className="flex items-start gap-4 p-4 hover:bg-muted/20"
              >
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${s.status === "NEW" ? "bg-red-500" : "bg-muted-foreground/30"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{s.name}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">{s.email}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground/70">
                    {s.service && <span>· {s.service}</span>}
                    {s.budget && <span>· {s.budget}</span>}
                    <span>· {new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONES[s.status] ?? STATUS_TONES.NEW}`}>
                  {s.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
