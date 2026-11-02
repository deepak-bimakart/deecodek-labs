import { SITE_NAME, SITE_URL } from "@/lib/seo";

/** Organization + WebSite JSON-LD for Google rich results / Knowledge Graph signals. */
export function SeoJsonLd() {
  const base = SITE_URL.replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE_NAME,
        url: base,
        logo: {
          "@type": "ImageObject",
          url: `${base}/logo-light.png`,
        },
        sameAs: [
          "https://github.com/deecodeklabs",
          "https://opensource.deecodeklabs.com",
        ],
        description:
          "Software studio and product lab — custom products, scalable backends, and useful tools.",
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE_NAME,
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
