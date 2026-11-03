import { db } from "@/lib/db";

export type AboutFounder = {
  name: string;
  bio: string;
  photo: string | null;
  url: string | null;
};

const DEFAULTS: AboutFounder = {
  name: "Deepak",
  bio: "Founder of DeeCodeK Labs. Builds and ships production software for clients while running studio products in parallel — schemas, deploys, and on-call included.",
  photo: null,
  url: "https://deecodeklabs.com/about",
};

function parseSetting(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** CMS keys: about.founder.name | bio | photo | url — honest placeholders when empty. */
export async function getAboutFounder(): Promise<AboutFounder> {
  try {
    const keys = [
      "about.founder.name",
      "about.founder.bio",
      "about.founder.photo",
      "about.founder.url",
    ];
    const rows = await db.siteSetting.findMany({ where: { key: { in: keys } } });
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      map[r.key] = parseSetting(r.value);
    }
    const str = (key: string) => {
      const v = map[key];
      return typeof v === "string" ? v.trim() : "";
    };

    return {
      name: str("about.founder.name") || DEFAULTS.name,
      bio: str("about.founder.bio") || DEFAULTS.bio,
      photo: str("about.founder.photo") || DEFAULTS.photo,
      url: str("about.founder.url") || DEFAULTS.url,
    };
  } catch {
    return { ...DEFAULTS };
  }
}
