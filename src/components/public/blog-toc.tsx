import type { TocHeading } from "@/lib/markdown-toc";

export function BlogToc({ headings }: { headings: TocHeading[] }) {
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-md border border-border bg-secondary/30 p-5"
    >
      <p className="mono-label mb-3">On this page</p>
      <ol className="space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
            <a
              href={`#${h.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
