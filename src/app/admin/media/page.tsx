import { db } from "@/lib/db";
import { MediaLibrary } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Media Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {media.length} assets · drag &amp; drop to upload, click to edit alt text
        </p>
      </div>
      <MediaLibrary initialMedia={media} />
    </div>
  );
}
