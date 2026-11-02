import { db } from "@/lib/db";
import { resolveSocialLinks } from "@/lib/social-links";

export type OSSProject = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  category?: string;
  filterCat?: string;
  technologies?: string[];
  stars?: number;
  forks?: number;
  isFeatured?: boolean;
  sortOrder?: number;
  status?: string;
  symbol?: string;
  createdAt?: string;
};

export async function getOpenSourceData() {
  const [projectsSetting, urlSetting, socialSettings] = await Promise.all([
    db.siteSetting.findUnique({ where: { key: "opensource.projects" } }),
    db.siteSetting.findUnique({ where: { key: "opensource.url" } }),
    db.siteSetting.findMany({
      where: {
        key: { in: ["social.links", "social.github", "social.linkedin", "social.twitter"] },
      },
    }),
  ]);

  let projects: OSSProject[] = [];
  if (projectsSetting) {
    try {
      const parsed = JSON.parse(projectsSetting.value);
      projects = Array.isArray(parsed) ? parsed : [];
    } catch {
      projects = [];
    }
  }

  projects = [...projects].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  let url = "https://opensource.deecodeklabs.com";
  if (urlSetting) {
    try {
      url = JSON.parse(urlSetting.value);
    } catch {
      url = urlSetting.value;
    }
  }

  const map: Record<string, any> = {};
  for (const s of socialSettings) {
    try {
      map[s.key] = JSON.parse(s.value);
    } catch {
      map[s.key] = s.value;
    }
  }
  const links = resolveSocialLinks(map);
  const githubUrl =
    links.find((l) => l.icon === "github")?.url ||
    (typeof map["social.github"] === "string" ? map["social.github"] : null) ||
    "https://github.com/deecodeklabs";

  const featured = projects.find((p) => p.isFeatured) ?? projects[0] ?? null;

  return { projects, featured, url, githubUrl, socialLinks: links };
}
