export type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
};

export function legacySocialToLinks(map: Record<string, any>): SocialLink[] {
  const links: SocialLink[] = [];
  const pairs: Array<[string, string, string]> = [
    ["social.github", "GitHub", "github"],
    ["social.linkedin", "LinkedIn", "linkedin"],
    ["social.twitter", "Twitter", "twitter"],
  ];
  for (const [key, label, icon] of pairs) {
    const url = map[key];
    if (typeof url === "string" && url.trim()) {
      links.push({
        id: `legacy_${icon}`,
        label,
        url: url.trim(),
        icon,
      });
    }
  }
  return links;
}

export function resolveSocialLinks(map: Record<string, any>): SocialLink[] {
  const raw = map["social.links"];
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter((l) => l && typeof l.url === "string" && l.url.trim())
      .map((l, i) => ({
        id: String(l.id ?? `link_${i}`),
        label: String(l.label ?? l.icon ?? "Link"),
        url: String(l.url).trim(),
        icon: String(l.icon ?? "link").toLowerCase(),
      }));
  }
  return legacySocialToLinks(map);
}
