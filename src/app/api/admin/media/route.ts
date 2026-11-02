import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

// GET /api/admin/media — list media
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "media.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const mimeType = url.searchParams.get("mimeType");
  const limit = parseInt(url.searchParams.get("limit") ?? "50");

  const media = await db.mediaAsset.findMany({
    where: {
      ...(search ? {
        OR: [
          { originalName: { contains: search } },
          { altText: { contains: search } },
          { filename: { contains: search } },
        ]
      } : {}),
      ...(mimeType ? { mimeType: { contains: mimeType } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { uploadedBy: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ media });
}
