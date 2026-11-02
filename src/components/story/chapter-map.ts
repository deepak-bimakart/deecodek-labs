import type { StoryChapterMeta } from "./story-chapter";

/** Homepage CMS sectionType → narrative chapter meta */
export const HOME_CHAPTER_BY_TYPE: Record<
  string,
  StoryChapterMeta & { pin?: boolean; motion?: "stack" | "horizontal" | "path" | "marquee" }
> = {
  hero: { id: "chapter-hook", index: "00", label: "THE HOOK" },
  editorial_text: { id: "chapter-who", index: "01", label: "WHO WE ARE", pin: true },
  capabilities_grid: {
    id: "chapter-capabilities",
    index: "02",
    label: "CAPABILITIES",
    motion: "stack",
  },
  product_showcase: {
    id: "chapter-products",
    index: "03",
    label: "PRODUCTS",
    motion: "horizontal",
  },
  process_timeline: {
    id: "chapter-process",
    index: "04",
    label: "PROCESS",
    motion: "path",
  },
  tech_stack: {
    id: "chapter-stack",
    index: "05",
    label: "STACK",
    motion: "marquee",
  },
  statistics: { id: "chapter-proof", index: "06", label: "PROOF" },
  testimonials: { id: "chapter-proof", index: "06", label: "PROOF" },
  portfolio_grid: { id: "chapter-proof", index: "06", label: "PROOF" },
  cta: { id: "chapter-close", index: "07", label: "NEXT" },
};

export function chapterForSectionType(sectionType: string, fallbackIndex: number): StoryChapterMeta {
  const known = HOME_CHAPTER_BY_TYPE[sectionType];
  if (known) {
    return { id: known.id, index: known.index, label: known.label };
  }
  return {
    id: `chapter-${fallbackIndex}`,
    index: String(fallbackIndex).padStart(2, "0"),
    label: "CHAPTER",
  };
}

export function chaptersFromSectionTypes(types: string[]): StoryChapterMeta[] {
  const seen = new Set<string>();
  const out: StoryChapterMeta[] = [];
  types.forEach((type, i) => {
    const meta = chapterForSectionType(type, i);
    if (seen.has(meta.id)) return;
    seen.add(meta.id);
    out.push(meta);
  });
  return out;
}
