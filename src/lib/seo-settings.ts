import { db } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export type GlobalSeoSettings = {
  siteName: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  orgAddress: string;
  orgEmail: string;
  googleVerification: string;
  bingVerification: string;
  robotsNotes: string;
};

const DEFAULTS: GlobalSeoSettings = {
  siteName: SITE_NAME,
  titleTemplate: "%s · DeeCodeK Labs",
  defaultTitle: "DeeCodeK Labs — Software Studio. Product Lab.",
  defaultDescription:
    "Custom products, scalable backends, and useful tools engineered for the real world. Software studio and product lab based in India.",
  defaultOgImage: "/logo-light.png",
  orgAddress: "",
  orgEmail: "",
  googleVerification: "7yf3lk44AjMw2D6lZ8-gHB_tkQUcV1xp7zTG48Jqtjk",
  bingVerification: "",
  robotsNotes: "",
};

function parseSetting(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export async function getGlobalSeoSettings(): Promise<GlobalSeoSettings> {
  try {
    const keys = [
      "seo.siteName",
      "seo.titleTemplate",
      "seo.defaultTitle",
      "seo.defaultDescription",
      "seo.defaultOgImage",
      "seo.orgAddress",
      "seo.orgEmail",
      "seo.verification.google",
      "seo.verification.bing",
      "seo.robotsNotes",
      "brand.name",
      "brand.email",
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
      siteName: str("seo.siteName") || str("brand.name") || DEFAULTS.siteName,
      titleTemplate: str("seo.titleTemplate") || DEFAULTS.titleTemplate,
      defaultTitle: str("seo.defaultTitle") || DEFAULTS.defaultTitle,
      defaultDescription: str("seo.defaultDescription") || DEFAULTS.defaultDescription,
      defaultOgImage: str("seo.defaultOgImage") || DEFAULTS.defaultOgImage,
      orgAddress: str("seo.orgAddress"),
      orgEmail: str("seo.orgEmail") || str("brand.email"),
      googleVerification: str("seo.verification.google") || DEFAULTS.googleVerification,
      bingVerification: str("seo.verification.bing"),
      robotsNotes: str("seo.robotsNotes"),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export { SITE_URL };
