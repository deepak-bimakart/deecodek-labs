"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultSchemaType,
  type SeoEntityKind,
} from "@/lib/json-ld-shared";

export type EntitySeoState = {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  schemaType: string;
  structuredData: string;
};

export const emptyEntitySeo = (): EntitySeoState => ({
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  robotsIndex: true,
  robotsFollow: true,
  schemaType: "",
  structuredData: "",
});

export function seoFromInitial(seo: any | null | undefined): EntitySeoState {
  if (!seo) return emptyEntitySeo();
  return {
    metaTitle: seo.metaTitle ?? "",
    metaDescription: seo.metaDescription ?? "",
    canonicalUrl: seo.canonicalUrl ?? "",
    ogTitle: seo.ogTitle ?? "",
    ogDescription: seo.ogDescription ?? "",
    ogImage: seo.ogImage ?? "",
    robotsIndex: seo.robotsIndex ?? true,
    robotsFollow: seo.robotsFollow ?? true,
    schemaType: seo.schemaType ?? "",
    structuredData: seo.structuredData ?? "",
  };
}

/** Payload for API: nested seo object (create/update attached SeoMetadata). */
export function seoPayload(seo: EntitySeoState) {
  return {
    metaTitle: seo.metaTitle || null,
    metaDescription: seo.metaDescription || null,
    canonicalUrl: seo.canonicalUrl || null,
    ogTitle: seo.ogTitle || null,
    ogDescription: seo.ogDescription || null,
    ogImage: seo.ogImage || null,
    robotsIndex: seo.robotsIndex,
    robotsFollow: seo.robotsFollow,
    schemaType: seo.schemaType || null,
    structuredData: seo.structuredData.trim() || null,
  };
}

const SCHEMA_OPTIONS: { value: string; label: string }[] = [
  { value: "__default__", label: "Default (inferred)" },
  { value: "BlogPosting", label: "BlogPosting" },
  { value: "Service", label: "Service" },
  { value: "SoftwareApplication", label: "SoftwareApplication" },
  { value: "WebPage", label: "WebPage" },
  { value: "CreativeWork", label: "CreativeWork" },
  { value: "FAQPage", label: "FAQPage" },
  { value: "Organization", label: "Organization" },
];

function validateStructuredDataJson(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed === null || typeof parsed !== "object") {
      return "Must be a JSON object or array";
    }
    return null;
  } catch {
    return "Invalid JSON";
  }
}

export function EntitySeoFields({
  value,
  onChange,
  entityType = "page",
}: {
  value: EntitySeoState;
  onChange: (next: EntitySeoState) => void;
  entityType?: SeoEntityKind;
}) {
  function set<K extends keyof EntitySeoState>(key: K, v: EntitySeoState[K]) {
    onChange({ ...value, [key]: v });
  }

  const inferred = defaultSchemaType(entityType);
  const jsonError = useMemo(
    () => validateStructuredDataJson(value.structuredData),
    [value.structuredData]
  );

  const selectValue = value.schemaType.trim() || "__default__";

  return (
    <Card className="space-y-4 p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        SEO
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="seo-metaTitle">Meta title</Label>
          <Input
            id="seo-metaTitle"
            value={value.metaTitle}
            onChange={(e) => set("metaTitle", e.target.value)}
            placeholder="Defaults to entity title"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="seo-metaDescription">Meta description</Label>
          <Textarea
            id="seo-metaDescription"
            value={value.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-canonical">Canonical URL</Label>
          <Input
            id="seo-canonical"
            value={value.canonicalUrl}
            onChange={(e) => set("canonicalUrl", e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-ogImage">OG image URL</Label>
          <Input
            id="seo-ogImage"
            value={value.ogImage}
            onChange={(e) => set("ogImage", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-ogTitle">OG title</Label>
          <Input
            id="seo-ogTitle"
            value={value.ogTitle}
            onChange={(e) => set("ogTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-ogDescription">OG description</Label>
          <Input
            id="seo-ogDescription"
            value={value.ogDescription}
            onChange={(e) => set("ogDescription", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={value.robotsIndex}
            onCheckedChange={(v) => set("robotsIndex", v)}
          />
          <Label>Index</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={value.robotsFollow}
            onCheckedChange={(v) => set("robotsFollow", v)}
          />
          <Label>Follow</Label>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Schema.org type</Label>
          <Select
            value={selectValue}
            onValueChange={(v) =>
              set("schemaType", v === "__default__" ? "" : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Default: ${inferred}`} />
            </SelectTrigger>
            <SelectContent>
              {SCHEMA_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.value === "__default__"
                    ? `Default (${inferred})`
                    : o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used as a hint for structured data. Empty uses{" "}
            <span className="font-mono">{inferred}</span> for this entity.
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="seo-structuredData">Custom JSON-LD</Label>
          <Textarea
            id="seo-structuredData"
            value={value.structuredData}
            onChange={(e) => set("structuredData", e.target.value)}
            rows={8}
            className="font-mono text-xs"
            placeholder={`{\n  "@type": "${inferred}",\n  "name": "…"\n}`}
            aria-invalid={!!jsonError}
          />
          {jsonError ? (
            <p className="text-xs text-destructive">{jsonError}</p>
          ) : value.structuredData.trim() ? (
            <p className="text-xs text-muted-foreground">Valid JSON object/array</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Optional override appended on the public page when valid JSON.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
