"use client";

import { ReactNode } from "react";
import { ScrollProgressChapters } from "./scroll-progress-chapters";
import type { StoryChapterMeta } from "./story-chapter";

/** Client shell that mounts the chapter progress rail around server-rendered sections. */
export function HomeStoryShell({
  chapters,
  children,
}: {
  chapters: StoryChapterMeta[];
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <ScrollProgressChapters chapters={chapters} />
      {children}
    </div>
  );
}
