import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/public/pages — list published pages
export async function GET() {
  const pages = await db.page.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      pageType: true,
      isHomepage: true,
      publishedAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ pages });
}
