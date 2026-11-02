import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { OpenSourceForm } from "@/components/admin/opensource-form";

export const dynamic = "force-dynamic";

export default async function NewOpenSourcePage() {
  const setting = await db.siteSetting.findUnique({ where: { key: "opensource.projects" } });
  let projects: any[] = [];
  if (setting) {
    try {
      projects = JSON.parse(setting.value);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/opensource"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to OSS projects
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          New open source project
        </h1>
      </div>
      <OpenSourceForm mode="create" allProjects={projects} />
    </div>
  );
}
