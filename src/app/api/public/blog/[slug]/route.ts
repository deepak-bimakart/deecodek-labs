import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { id: true, name: true, email: true } },
      tags: { include: { tag: true } },
      seo: true,
    },
  });
  if (!post || post.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Related posts (same category, exclude this one)
  const related = post.categoryId
    ? await db.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          categoryId: post.categoryId,
          id: { not: post.id },
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
      })
    : [];

  return NextResponse.json({ post, related });
}
