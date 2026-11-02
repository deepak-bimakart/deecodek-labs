import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/admin/project-form";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to portfolio
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">New project</h1>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
