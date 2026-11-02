import Link from "next/link";
import { Plus, Github, ExternalLink, Star, GitFork } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpenSourceManager } from "@/components/admin/opensource-manager";

export const dynamic = "force-dynamic";

export default async function AdminOpenSourcePage() {
  const setting = await db.siteSetting.findUnique({ where: { key: "opensource.projects" } });
  let projects: any[] = [];
  if (setting) {
    try { projects = JSON.parse(setting.value); } catch {}
  }

  // Also get the OSS site URL from settings
  const ossUrlSetting = await db.siteSetting.findUnique({ where: { key: "opensource.url" } });
  const ossUrl = ossUrlSetting ? JSON.parse(ossUrlSetting.value) : "https://opensource.deecodeklabs.com";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Open Source Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage projects that appear on{" "}
            <a
              href={ossUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-primary hover:underline"
            >
              opensource.deecodeklabs.com <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={ossUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> View OSS site
            </a>
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <Card className="border-primary/30 bg-brand-soft p-4">
        <div className="flex items-start gap-3">
          <Github className="mt-0.5 h-5 w-5 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              Open Source Panel — {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
            <p className="mt-1 text-muted-foreground">
              Projects added here will be published to <code className="font-mono text-primary">{ossUrl}</code>.
              The OSS site is a separate Next.js app that reads from this CMS via the public API.
              Add GitHub repos, demos, and tech stack info for each project.
            </p>
          </div>
        </div>
      </Card>

      <OpenSourceManager initialProjects={projects} ossUrl={ossUrl} />

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-2xl font-semibold">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Total projects</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-2xl font-semibold">
                {projects.reduce((sum, p) => sum + (p.stars || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total GitHub stars</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <GitFork className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-2xl font-semibold">
                {projects.reduce((sum, p) => sum + (p.forks || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total forks</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
