import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceForm } from "@/components/admin/service-form";

export const dynamic = "force-dynamic";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to services
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">New service</h1>
      </div>
      <ServiceForm mode="create" />
    </div>
  );
}
