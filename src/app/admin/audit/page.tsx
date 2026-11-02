import { ScrollText } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { requireAuth } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAuth();

  const logs = await db.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only history of admin actions · showing latest {logs.length} entries
        </p>
      </div>

      <Card className="overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No audit entries yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block truncate max-w-[180px]">
                        {log.user?.name || log.user?.email || "—"}
                      </span>
                      {log.user?.email && log.user?.name ? (
                        <span className="block truncate max-w-[180px] font-mono text-[10px] text-muted-foreground">
                          {log.user.email}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{log.action}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {log.entityType}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                      {log.entityId ? (
                        <span className="truncate inline-block max-w-[120px]" title={log.entityId}>
                          {log.entityId}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
