"use client";

import { useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StoryChapterMeta } from "./story-chapter";

export function ScrollProgressChapters({
  chapters,
  className,
}: {
  chapters: StoryChapterMeta[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (chapters.length === 0) return;

    const nodes = chapters
      .map((c) => document.getElementById(c.id))
      .filter(Boolean) as HTMLElement[];

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] }
    );

    nodes.forEach((n) => observer.observe(n));

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [chapters]);

  const jumpTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const scrollTo = (window as any).lenisScrollTo;
      if (typeof scrollTo === "function" && !reduce) {
        scrollTo(`#${id}`, { offset: 0 });
      } else {
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
    },
    [reduce]
  );

  if (chapters.length === 0) return null;

  return (
    <aside
      className={cn(
        "story-progress-rail pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block",
        className
      )}
      aria-label="Story chapters"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <div className="story-progress-track" aria-hidden>
          <div
            className="story-progress-fill"
            style={{ transform: `scaleY(${Math.min(1, Math.max(0, progress))})` }}
          />
        </div>
        <nav className="flex flex-col items-end gap-1.5">
          {chapters.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => jumpTo(c.id)}
                className={cn(
                  "group flex items-center gap-2 text-right transition-colors",
                  active ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"
                )}
                aria-current={active ? "true" : undefined}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                  )}
                >
                  {c.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums tracking-wider",
                    active ? "text-primary" : ""
                  )}
                >
                  {c.index}
                </span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    active ? "scale-125 bg-primary" : "bg-border group-hover:bg-muted-foreground"
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
