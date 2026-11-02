import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [projectsSetting, urlSetting] = await Promise.all([
    db.siteSetting.findUnique({ where: { key: "opensource.projects" } }),
    db.siteSetting.findUnique({ where: { key: "opensource.url" } }),
  ]);

  let projects: any[] = [];
  if (projectsSetting) {
    try {
      projects = JSON.parse(projectsSetting.value);
      if (!Array.isArray(projects)) projects = [];
    } catch {
      projects = [];
    }
  }

  projects = [...projects].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  let url = "https://opensource.deecodeklabs.com";
  if (urlSetting) {
    try {
      url = JSON.parse(urlSetting.value);
    } catch {
      url = urlSetting.value;
    }
  }

  const featured = projects.find((p) => p.isFeatured) ?? projects[0] ?? null;

  return NextResponse.json(
    { projects, featured, url },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
