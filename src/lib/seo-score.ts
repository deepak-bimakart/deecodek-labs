export type SeoScoreInput = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  robotsIndex?: boolean | null;
  includeInSitemap?: boolean | null;
  schemaType?: string | null;
  structuredData?: string | null;
  fallbackTitle?: string | null;
};

export type SeoChecklistItem = {
  id: string;
  label: string;
  passed: boolean;
  severity: "error" | "warning" | "info";
};

export type SeoScoreResult = {
  score: number;
  maxScore: number;
  items: SeoChecklistItem[];
  warnings: string[];
};

const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 140;
const DESC_MAX = 160;

export function titleLengthTone(len: number): "green" | "amber" | "red" {
  if (len === 0) return "red";
  if (len >= TITLE_MIN && len <= TITLE_MAX) return "green";
  if (len >= 40 && len <= 70) return "amber";
  return "red";
}

export function descriptionLengthTone(len: number): "green" | "amber" | "red" {
  if (len === 0) return "red";
  if (len >= DESC_MIN && len <= DESC_MAX) return "green";
  if (len >= 110 && len <= 180) return "amber";
  return "red";
}

export function computeSeoScore(input: SeoScoreInput): SeoScoreResult {
  const title = (input.metaTitle || input.fallbackTitle || "").trim();
  const description = (input.metaDescription || "").trim();
  const focus = (input.focusKeyword || "").trim().toLowerCase();
  const items: SeoChecklistItem[] = [];

  const titleLenOk = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
  items.push({
    id: "title-length",
    label: `Meta title length ${TITLE_MIN}–${TITLE_MAX} characters`,
    passed: titleLenOk,
    severity: title.length === 0 ? "error" : "warning",
  });

  items.push({
    id: "title-present",
    label: "Meta title is set",
    passed: title.length > 0,
    severity: "error",
  });

  const descLenOk = description.length >= DESC_MIN && description.length <= DESC_MAX;
  items.push({
    id: "description-length",
    label: `Meta description length ${DESC_MIN}–${DESC_MAX} characters`,
    passed: descLenOk,
    severity: description.length === 0 ? "error" : "warning",
  });

  items.push({
    id: "description-present",
    label: "Meta description is set",
    passed: description.length > 0,
    severity: "error",
  });

  const hasFocus = focus.length > 0;
  items.push({
    id: "focus-keyword",
    label: "Focus keyword set",
    passed: hasFocus,
    severity: "warning",
  });

  if (hasFocus) {
    items.push({
      id: "keyword-in-title",
      label: "Focus keyword appears in title",
      passed: title.toLowerCase().includes(focus),
      severity: "warning",
    });
    items.push({
      id: "keyword-in-description",
      label: "Focus keyword appears in description",
      passed: description.toLowerCase().includes(focus),
      severity: "info",
    });
  }

  items.push({
    id: "og-image",
    label: "Open Graph image set",
    passed: Boolean(input.ogImage?.trim()),
    severity: "warning",
  });

  items.push({
    id: "canonical",
    label: "Canonical URL set (optional but recommended)",
    passed: Boolean(input.canonicalUrl?.trim()),
    severity: "info",
  });

  items.push({
    id: "indexable",
    label: "Page is indexable (robots index on)",
    passed: input.robotsIndex !== false,
    severity: "info",
  });

  items.push({
    id: "sitemap",
    label: "Included in sitemap",
    passed: input.includeInSitemap !== false,
    severity: "info",
  });

  const hasSchema =
    Boolean(input.schemaType?.trim()) || Boolean(input.structuredData?.trim());
  items.push({
    id: "schema",
    label: "Schema type or custom JSON-LD set",
    passed: hasSchema,
    severity: "info",
  });

  if (input.structuredData?.trim()) {
    let jsonOk = false;
    try {
      JSON.parse(input.structuredData);
      jsonOk = true;
    } catch {
      jsonOk = false;
    }
    items.push({
      id: "jsonld-valid",
      label: "Custom JSON-LD is valid JSON",
      passed: jsonOk,
      severity: "error",
    });
  }

  const weight = (item: SeoChecklistItem) =>
    item.severity === "error" ? 3 : item.severity === "warning" ? 2 : 1;
  const maxScore = items.reduce((s, i) => s + weight(i) * 10, 0);
  const earned = items.reduce((s, i) => s + (i.passed ? weight(i) * 10 : 0), 0);
  const score = maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0;
  const warnings = items.filter((i) => !i.passed).map((i) => i.label);

  return { score, maxScore: 100, items, warnings };
}
