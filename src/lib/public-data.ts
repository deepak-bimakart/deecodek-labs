import { db } from "@/lib/db";
import { resolveSocialLinks, type SocialLink } from "@/lib/social-links";

export type PublicNav = {
  items: Array<{
    id: string;
    label: string;
    url: string;
    isButton: boolean;
    isNewTab: boolean;
    sortOrder: number;
  }>;
};

export type SiteConfig = {
  brandName: string;
  tagline: string;
  email: string;
  social: {
    links: SocialLink[];
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  theme: {
    default: "light" | "dark";
    available: string[];
  };
};

export async function getHeaderNav(): Promise<PublicNav> {
  const menu = await db.navigationMenu.findUnique({
    where: { slug: "header" },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!menu) return { items: [] };
  return {
    items: menu.items.map((i) => ({
      id: i.id,
      label: i.label,
      url: i.url,
      isButton: i.isButton,
      isNewTab: i.isNewTab,
      sortOrder: i.sortOrder,
    })),
  };
}

export async function getFooterNav(): Promise<PublicNav> {
  const menu = await db.navigationMenu.findUnique({
    where: { slug: "footer" },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!menu) return { items: [] };
  return {
    items: menu.items.map((i) => ({
      id: i.id,
      label: i.label,
      url: i.url,
      isButton: i.isButton,
      isNewTab: i.isNewTab,
      sortOrder: i.sortOrder,
    })),
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const settings = await db.siteSetting.findMany();
  const map: Record<string, any> = {};
  for (const s of settings) {
    try {
      map[s.key] = JSON.parse(s.value);
    } catch {
      map[s.key] = s.value;
    }
  }
  const links = resolveSocialLinks(map);
  return {
    brandName: map["brand.name"] ?? "DeeCodeK Labs",
    tagline: map["brand.tagline"] ?? "Software Studio. Product Lab.",
    email: map["brand.email"] ?? "hello@deecodeklabs.com",
    social: {
      links,
      github: map["social.github"] ?? links.find((l) => l.icon === "github")?.url,
      linkedin: map["social.linkedin"] ?? links.find((l) => l.icon === "linkedin")?.url,
      twitter: map["social.twitter"] ?? links.find((l) => l.icon === "twitter")?.url,
    },
    theme: {
      default: map["theme.default"] ?? "light",
      available: map["theme.available"] ?? ["light", "dark"],
    },
  };
}
