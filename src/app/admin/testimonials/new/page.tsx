import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to testimonials
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">New testimonial</h1>
      </div>
      <TestimonialForm mode="create" />
    </div>
  );
}
