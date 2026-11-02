import Link from "next/link";
import {
  FileText,
  Newspaper,
  Boxes,
  Wrench,
  FolderKanban,
  Mail,
  ImageIcon,
  Eye,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [
    pagesTotal,
    pagesPublished,
    pagesDraft,
    postsTotal,
    postsPublished,
    productsTotal,
    servicesTotal,
    projectsTotal,
    contactUnread,
    contactTotal,
    mediaTotal,
    recentContact,
    recentLogs,
  ] = await Promise.all([
    db.page.count(),
    db.page.count({ where: { status: "PUBLISHED" } }),
    db.page.count({ where: { status: "DRAFT" } }),
    db.blogPost.count(),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.product.count(),
    db.service.count(),
    db.project.count(),
    db.contactSubmission.count({ where: { status: "NEW" } }),
    db.contactSubmission.count(),
    db.mediaAsset.count(),
    db.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const stats = [
    { label: "Published Pages", value: pagesPublished, total: pagesTotal, href: "/admin/pages", icon: FileText, color: "text-emerald-600" },
    { label: "Draft Pages", value: pagesDraft, total: pagesTotal, href: "/admin/pages", icon: FileText, color: "text-amber-600" },
    { label: "Published Posts", value: postsPublished, total: postsTotal, href: "/admin/blog", icon: Newspaper, color: "text-emerald-600" },
    { label: "Products", value: productsTotal, href: "/admin/products", icon: Boxes, color: "text-primary" },
    { label: "Services", value: servicesTotal, href: "/admin/services", icon: Wrench, color: "text-primary" },
    { label: "Portfolio", value: projectsTotal, href: "/admin/portfolio", icon: FolderKanban, color: "text-primary" },
    { label: "Unread Inquiries", value: contactUnread, total: contactTotal, href: "/admin/contact", icon: Mail, color: contactUnread > 0 ? "text-red-600" : "text-muted-foreground" },
    { label: "Media Assets", value: mediaTotal, href: "/admin/media", icon: ImageIcon, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Welcome back, {user?.name ?? "admin"}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in your CMS today.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          <Eye className="h-3.5 w-3.5" /> View live site
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <Icon className={`h-5 w-5 ${s.color}`} />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4">
                <p className="font-display text-3xl font-semibold">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.label}
                  {s.total !== undefined && s.total !== s.value && (
                    <span className="ml-1 text-muted-foreground/60">/ {s.total} total</span>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent inquiries */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent inquiries</h2>
            <Link href="/admin/contact" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          {recentContact.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No contact submissions yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentContact.map((c) => (
                <li key={c.id} className="rounded-md border border-border p-3 hover:bg-muted/30">
                  <Link href={`/admin/contact/${c.id}`} className="block">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{c.name}</p>
                      <Badge
                        variant={c.status === "NEW" ? "default" : "secondary"}
                        className="font-mono text-[10px]"
                      >
                        {c.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{c.message}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
                      {c.email} · {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent activity
            </h2>
          </div>
          {recentLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No activity logged yet.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-foreground">
                      <span className="font-mono text-xs text-primary">{log.action}</span>{" "}
                      on <span className="font-mono text-xs">{log.entityType}</span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {log.user?.name ?? log.user?.email ?? "system"} ·{" "}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pages"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Edit homepage
          </Link>
          <Link
            href="/admin/blog"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            New blog post
          </Link>
          <Link
            href="/admin/products"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Add product
          </Link>
          <Link
            href="/admin/media"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Upload media
          </Link>
          <Link
            href="/admin/contact"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Review contact ({contactUnread} new)
          </Link>
        </div>
      </Card>
    </div>
  );
}
