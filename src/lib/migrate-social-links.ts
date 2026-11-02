import { db } from "@/lib/db";
import { legacySocialToLinks } from "@/lib/social-links";

/** If `social.links` is missing but legacy keys exist, seed the array from them. */
export async function ensureSocialLinksSetting() {
  const existing = await db.siteSetting.findUnique({ where: { key: "social.links" } });
  if (existing) {
    try {
      const parsed = JSON.parse(existing.value);
      if (Array.isArray(parsed) && parsed.length > 0) return;
    } catch {
      // fall through and reseed
    }
  }

  const legacy = await db.siteSetting.findMany({
    where: { key: { in: ["social.github", "social.linkedin", "social.twitter"] } },
  });
  if (legacy.length === 0) return;

  const map: Record<string, any> = {};
  for (const s of legacy) {
    try {
      map[s.key] = JSON.parse(s.value);
    } catch {
      map[s.key] = s.value;
    }
  }

  const links = legacySocialToLinks(map);
  if (links.length === 0) return;

  await db.siteSetting.upsert({
    where: { key: "social.links" },
    update: { value: JSON.stringify(links) },
    create: { key: "social.links", value: JSON.stringify(links) },
  });
}
