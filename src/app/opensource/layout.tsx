import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildPageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { ORG_ID } from "@/lib/json-ld";
import { JsonLd } from "@/components/seo-json-ld";

const OSS_URL = "https://opensource.deecodeklabs.com";

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

/** Same Organization @id as the marketing site so entities stay unified across hosts. */
function OpenSourceOrgJsonLd() {
  const mainBase = SITE_URL.replace(/\/$/, "");
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": ["Organization", "ProfessionalService"],
            "@id": ORG_ID(),
            name: SITE_NAME,
            url: mainBase,
            sameAs: [OSS_URL, "https://github.com/deecodeklabs"],
          },
          {
            "@type": "WebSite",
            "@id": `${OSS_URL}/#website`,
            name: `${SITE_NAME} Open Source`,
            url: OSS_URL,
            publisher: { "@id": ORG_ID() },
            isPartOf: { "@id": `${mainBase}/#website` },
          },
        ],
      }}
    />
  );
}

export default function OpenSourceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OpenSourceOrgJsonLd />
      {children}
    </>
  );
}
