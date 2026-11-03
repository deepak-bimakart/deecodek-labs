import { db } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = SITE_URL.replace(/\/$/, "");
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  const items = posts
    .map((post) => {
      const link = `${base}/blog/${post.slug}`;
      const pubDate = (post.publishedAt ?? post.createdAt).toUTCString();
      const description = escapeXml(post.excerpt || post.title);
      const title = escapeXml(post.title);
      const author = post.author?.name ? escapeXml(post.author.name) : SITE_NAME;
      const category = post.category?.name
        ? `<category>${escapeXml(post.category.name)}</category>`
        : "";

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>${author}</author>
      ${category}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} Blog</title>
    <link>${base}/blog</link>
    <description>Engineering and product notes from ${escapeXml(SITE_NAME)}.</description>
    <language>en-in</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
