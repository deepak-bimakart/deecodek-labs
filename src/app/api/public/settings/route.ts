import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveSocialLinks } from "@/lib/social-links";

/** Public settings keys safe to expose without auth. */
const PUBLIC_KEYS = new Set([
  "brand.name",
  "brand.tagline",
  "brand.email",
  "theme.default",
  "social.github",
  "social.linkedin",
  "social.twitter",
  "social.links",
  "homepage.primaryCtaLabel",
  "homepage.primaryCtaHref",
  "homepage.secondaryCtaLabel",
  "homepage.secondaryCtaHref",
  "opensource.url",
]);

export async function GET() {
  const settings = await db.siteSetting.findMany({
    where: { key: { in: [...PUBLIC_KEYS] } },
  });
  const map: Record<string, unknown> = {};
  for (const s of settings) {
    try {
      map[s.key] = JSON.parse(s.value);
    } catch {
      map[s.key] = s.value;
    }
  }
  // Ensure API consumers always get social.links (legacy fallback)
  map["social.links"] = resolveSocialLinks(map as Record<string, any>);
  return NextResponse.json(
    { settings: map },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
