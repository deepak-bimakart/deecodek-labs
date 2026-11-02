import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewPageForm } from "@/components/admin/new-page-form";

export const dynamic = "force-dynamic";

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to pages
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">New page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new page as a draft. You&apos;ll add sections in the next step.
        </p>
      </div>
      <NewPageForm />
    </div>
  );
}
