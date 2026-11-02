import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/public/pages/[slug] — full page with sections
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      seo: true,
    },
  });
  if (!page || page.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ page });
}
