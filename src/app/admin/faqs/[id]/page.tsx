import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { FaqForm } from "@/components/admin/faq-form";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = await db.faq.findUnique({ where: { id } });
  if (!faq) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/faqs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to FAQs
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">Edit FAQ</h1>
      </div>
      <FaqForm mode="edit" faqId={faq.id} initial={faq} />
    </div>
  );
}
