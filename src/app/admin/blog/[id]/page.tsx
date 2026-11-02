import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, categories, tags] = await Promise.all([
    db.blogPost.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, seo: true },
    }),
    db.blogCategory.findMany({ orderBy: { name: "asc" } }),
    db.blogTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit: {post.title}
        </h1>
      </div>
      <BlogPostForm
        mode="edit"
        postId={post.id}
        initial={post}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
