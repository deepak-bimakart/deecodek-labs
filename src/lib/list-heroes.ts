import { db } from "@/lib/db";

export type ListHero = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

const DEFAULTS: Record<string, ListHero> = {
  products: {
    eyebrow: "Products from the Lab",
    title: "Built in-house. Used in production.",
    subtitle:
      "Products we build to scratch our own itch — then turn into something others can use.",
  },
  work: {
    eyebrow: "Work",
    title: "Selected projects and case studies.",
    subtitle:
      "We don't publish case studies we can't stand behind. When a project ships and the story is real, it shows up here.",
  },
  blog: {
    eyebrow: "Blog",
    title: "Writing on engineering, product, and studio life.",
    subtitle: "Notes from building software in the open.",
  },
  services: {
    eyebrow: "Services",
    title: "Six categories of work we ship.",
    subtitle:
      "From a blank repo to a deployed product. Each category maps to a real codebase we've shipped.",
  },
};

export async function getListHero(key: string): Promise<ListHero> {
  const setting = await db.siteSetting.findUnique({
    where: { key: `listHero.${key}` },
  });
  if (!setting) return DEFAULTS[key] ?? DEFAULTS.products;
  try {
    const parsed = JSON.parse(setting.value) as Partial<ListHero>;
    return {
      eyebrow: parsed.eyebrow || DEFAULTS[key]?.eyebrow || "",
      title: parsed.title || DEFAULTS[key]?.title || "",
      subtitle: parsed.subtitle || DEFAULTS[key]?.subtitle || "",
    };
  } catch {
    return DEFAULTS[key] ?? DEFAULTS.products;
  }
}
