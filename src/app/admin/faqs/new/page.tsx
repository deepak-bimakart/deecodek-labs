import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FaqForm } from "@/components/admin/faq-form";

export const dynamic = "force-dynamic";

export default function NewFaqPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/faqs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to FAQs
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">New FAQ</h1>
      </div>
      <FaqForm mode="create" />
    </div>
  );
}
