import Link from "next/link";
import type { BlogPost, BlogCategory, User } from "@prisma/client";

type BlogCardPost = BlogPost & {
  category: BlogCategory | null;
  author: User | null;
};

export function BlogCard({ post }: { post: BlogCardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-muted">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-3xl text-muted-foreground/40">
              {post.category?.name?.[0] ?? "D"}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {post.category && (
            <span className="font-mono uppercase tracking-wider text-primary">
              {post.category.name}
            </span>
          )}
          <span>{post.readingMinutes} min read</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        {post.publishedAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}
