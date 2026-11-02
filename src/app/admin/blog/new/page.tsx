import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const [categories, tags] = await Promise.all([
    db.blogCategory.findMany({ orderBy: { name: "asc" } }),
    db.blogTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to blog
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">New blog post</h1>
      </div>
      <BlogPostForm mode="create" categories={categories} tags={tags} />
    </div>
  );
}
