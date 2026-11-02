import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ContactDetail } from "@/components/admin/contact-detail";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await db.contactSubmission.findUnique({
    where: { id },
    include: {
      notes: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!submission) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/contact"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to submissions
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          {submission.name}
        </h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{submission.email}</p>
      </div>
      <ContactDetail submission={submission} />
    </div>
  );
}
