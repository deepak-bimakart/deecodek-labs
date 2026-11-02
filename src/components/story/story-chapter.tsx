"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StoryChapterMeta = {
  id: string;
  index: string;
  label: string;
};

export function StoryChapter({
  id,
  index,
  label,
  children,
  className,
  showEyebrow = true,
  eyebrowOverlay = false,
  as: Tag = "section",
}: {
  id: string;
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
  showEyebrow?: boolean;
  /** When true, float eyebrow over chapter content (home heroes). */
  eyebrowOverlay?: boolean;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      id={id}
      data-story-chapter={id}
      data-chapter-index={index}
      data-chapter-label={label}
      className={cn("story-chapter relative", className)}
    >
      {showEyebrow && eyebrowOverlay && (
        <div className="pointer-events-none absolute left-6 top-6 z-20 lg:left-10 lg:top-8">
          <p className="story-chapter-eyebrow" aria-hidden>
            <span className="story-chapter-index">{index}</span>
            <span className="story-chapter-divider" />
            <span className="story-chapter-label">{label}</span>
          </p>
        </div>
      )}
      {showEyebrow && !eyebrowOverlay && (
        <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
          <p className="story-chapter-eyebrow">
            <span className="story-chapter-index">{index}</span>
            <span className="story-chapter-divider" />
            <span className="story-chapter-label">{label}</span>
          </p>
        </div>
      )}
      {children}
    </Tag>
  );
}
