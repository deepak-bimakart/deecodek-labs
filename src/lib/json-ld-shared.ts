export type SeoEntityKind = "blog" | "service" | "product" | "project" | "page";

export function defaultSchemaType(kind: SeoEntityKind): string {
  switch (kind) {
    case "blog":
      return "BlogPosting";
    case "service":
      return "Service";
    case "product":
      return "SoftwareApplication";
    case "project":
      return "CreativeWork";
    case "page":
    default:
      return "WebPage";
  }
}

export function resolveSchemaType(
  schemaType: string | null | undefined,
  kind: SeoEntityKind
): string {
  const t = schemaType?.trim();
  return t || defaultSchemaType(kind);
}

/** Escape `<` so JSON-LD embedded in HTML cannot break out of the script tag. */
export function stringifyJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Parse CMS custom structuredData. Returns a plain object or array only;
 * rejects primitives, null, and invalid JSON.
 */
export function parseCustomStructuredData(
  raw: string | null | undefined
): Record<string, unknown> | unknown[] | null {
  if (raw == null || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed !== null && typeof parsed === "object") return parsed;
    return null;
  } catch {
    return null;
  }
}
