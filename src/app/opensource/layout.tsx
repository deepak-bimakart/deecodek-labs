import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const keys = [
    "opensource.seo.title",
    "opensource.seo.description",
    "opensource.seo.ogImage",
  ];
  const rows = await db.siteSetting.findMany({ where: { key: { in: keys } } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return buildPageMetadata(
    {
      metaTitle: map["opensource.seo.title"] || "Open Source Playground",
      metaDescription:
        map["opensource.seo.description"] ||
        "Small experiments. Useful tools. Developer-first open source software from DeeCodeK Labs.",
      ogImage: map["opensource.seo.ogImage"] || null,
      robotsIndex: true,
      robotsFollow: true,
    },
    {
      title: "Open Source Playground",
      description:
        "Small experiments. Useful tools. Developer-first open source software from DeeCodeK Labs.",
      path: "/opensource",
    }
  );
}

export default function OpenSourceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
