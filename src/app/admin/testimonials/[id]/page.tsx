import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to testimonials
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">Edit testimonial</h1>
      </div>
      <TestimonialForm mode="edit" testimonialId={testimonial.id} initial={testimonial} />
    </div>
  );
}
