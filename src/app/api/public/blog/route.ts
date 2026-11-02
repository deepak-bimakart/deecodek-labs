import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const tag = req.nextUrl.searchParams.get("tag");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

  const posts = await db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, email: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ posts });
}
