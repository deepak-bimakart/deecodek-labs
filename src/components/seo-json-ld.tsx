import { buildSiteJsonLdGraph } from "@/lib/json-ld";
import {
  parseCustomStructuredData,
  stringifyJsonLd,
} from "@/lib/json-ld-shared";

/** Safe JSON-LD script tag for server HTML. */
export function JsonLd({ data }: { data: unknown }) {
  if (data == null) return null;
  if (typeof data === "object" && !Array.isArray(data) && Object.keys(data as object).length === 0) {
    return null;
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: stringifyJsonLd(data) }}
    />
  );
}

/** Renders CMS `structuredData` only when it parses to an object or array. */
export function CustomJsonLd({ raw }: { raw: string | null | undefined }) {
  const parsed = parseCustomStructuredData(raw);
  if (!parsed) return null;
  // Ensure @context if missing on a plain object (not required for arrays / @graph)
  if (!Array.isArray(parsed) && !("@context" in parsed)) {
    return <JsonLd data={{ "@context": "https://schema.org", ...parsed }} />;
  }
  return <JsonLd data={parsed} />;
}

/** Organization + ProfessionalService + WebSite JSON-LD (site-wide). */
export async function SeoJsonLd() {
  const graph = await buildSiteJsonLdGraph();
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": graph,
      }}
    />
  );
}
