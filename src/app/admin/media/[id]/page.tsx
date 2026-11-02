import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { MediaEditForm } from "@/components/admin/media-edit-form";

export const dynamic = "force-dynamic";

export default async function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/media"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to media
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">Edit media</h1>
        <p className="mt-1 text-sm text-muted-foreground">{asset.originalName}</p>
      </div>
      <MediaEditForm asset={asset} />
    </div>
  );
}
