"use client";

import { useMemo, useState } from "react";
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
  computeSeoScore,
  descriptionLengthTone,
  titleLengthTone,
} from "@/lib/seo-score";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type EntitySeoState = {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  focusKeyword: string;
  secondaryKeywords: string;
  schemaType: string;
  breadcrumbLabel: string;
  includeInSitemap: boolean;
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
  focusKeyword: "",
  secondaryKeywords: "",
  schemaType: "",
  breadcrumbLabel: "",
  includeInSitemap: true,
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
    focusKeyword: seo.focusKeyword ?? "",
    secondaryKeywords: seo.secondaryKeywords ?? "",
    schemaType: seo.schemaType ?? "",
    breadcrumbLabel: seo.breadcrumbLabel ?? "",
    includeInSitemap: seo.includeInSitemap ?? true,
    structuredData: seo.structuredData ?? "",
  };
}

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
    focusKeyword: seo.focusKeyword || null,
    secondaryKeywords: seo.secondaryKeywords || null,
    schemaType: seo.schemaType || null,
    breadcrumbLabel: seo.breadcrumbLabel || null,
    includeInSitemap: seo.includeInSitemap,
    structuredData: seo.structuredData || null,
  };
}

const SCHEMA_TYPES = [
  { value: "WebPage", label: "WebPage" },
  { value: "Article", label: "Article" },
  { value: "BlogPosting", label: "BlogPosting" },
  { value: "Service", label: "Service" },
  { value: "Product", label: "Product" },
  { value: "FAQPage", label: "FAQPage" },
  { value: "Organization", label: "Organization" },
  { value: "custom", label: "Custom (JSON-LD only)" },
];

function counterClass(tone: "green" | "amber" | "red") {
  if (tone === "green") return "text-emerald-600";
  if (tone === "amber") return "text-amber-600";
  return "text-destructive";
}

function SnippetPreview({
  title,
  description,
  path,
  mode,
}: {
  title: string;
  description: string;
  path: string;
  mode: "desktop" | "mobile";
}) {
  const displayTitle = title || "Page title";
  const displayDesc =
    description || "Meta description preview appears here once you add one.";
  const host = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const urlLine = `${host}${path.startsWith("/") ? path : `/${path}`}`;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background p-3",
        mode === "mobile" ? "max-w-[320px]" : "max-w-xl"
      )}
    >
      <p className="truncate text-xs text-muted-foreground">{urlLine}</p>
      <p
        className={cn(
          "mt-1 truncate font-medium text-[#1a0dab] dark:text-blue-400",
          mode === "mobile" ? "text-base" : "text-lg"
        )}
      >
        {displayTitle}
      </p>
      <p
        className={cn(
          "mt-1 text-sm text-muted-foreground",
          mode === "mobile" ? "line-clamp-3" : "line-clamp-2"
        )}
      >
        {displayDesc}
      </p>
    </div>
  );
}

export function EntitySeoFields({
  value,
  onChange,
  fallbackTitle = "",
  previewPath = "/",
}: {
  value: EntitySeoState;
  onChange: (next: EntitySeoState) => void;
  fallbackTitle?: string;
  previewPath?: string;
}) {
  const [snippetMode, setSnippetMode] = useState<"desktop" | "mobile">("desktop");
  const [jsonError, setJsonError] = useState<string | null>(null);

  function set<K extends keyof EntitySeoState>(key: K, v: EntitySeoState[K]) {
    onChange({ ...value, [key]: v });
  }

  const titleForPreview = value.metaTitle || fallbackTitle || SITE_NAME;
  const titleLen = value.metaTitle.length;
  const descLen = value.metaDescription.length;

  const scoreResult = useMemo(
    () => computeSeoScore({ ...value, fallbackTitle }),
    [value, fallbackTitle]
  );

  function onStructuredDataChange(raw: string) {
    set("structuredData", raw);
    if (!raw.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(raw);
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON");
    }
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          SEO
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Score{" "}
          <span
            className={cn(
              "font-semibold",
              scoreResult.score >= 80
                ? "text-emerald-600"
                : scoreResult.score >= 50
                  ? "text-amber-600"
                  : "text-destructive"
            )}
          >
            {scoreResult.score}/100
          </span>
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>Google snippet preview</Label>
          <div className="flex gap-1">
            <button
              type="button"
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[10px] uppercase",
                snippetMode === "desktop" ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setSnippetMode("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[10px] uppercase",
                snippetMode === "mobile" ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setSnippetMode("mobile")}
            >
              Mobile
            </button>
          </div>
        </div>
        <SnippetPreview
          title={titleForPreview}
          description={value.metaDescription}
          path={previewPath}
          mode={snippetMode}
        />
      </div>

      {scoreResult.warnings.length > 0 && (
        <ul className="space-y-1 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-200">
          {scoreResult.warnings.slice(0, 6).map((w) => (
            <li key={w}>• {w}</li>
          ))}
          {scoreResult.warnings.length > 6 && (
            <li>• +{scoreResult.warnings.length - 6} more</li>
          )}
        </ul>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-metaTitle">Meta title</Label>
            <span className={cn("font-mono text-xs", counterClass(titleLengthTone(titleLen)))}>
              {titleLen}/60
            </span>
          </div>
          <Input
            id="seo-metaTitle"
            value={value.metaTitle}
            onChange={(e) => set("metaTitle", e.target.value)}
            placeholder={fallbackTitle || "Defaults to entity title"}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-metaDescription">Meta description</Label>
            <span className={cn("font-mono text-xs", counterClass(descriptionLengthTone(descLen)))}>
              {descLen}/160
            </span>
          </div>
          <Textarea
            id="seo-metaDescription"
            value={value.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-focusKeyword">Focus keyword</Label>
          <Input
            id="seo-focusKeyword"
            value={value.focusKeyword}
            onChange={(e) => set("focusKeyword", e.target.value)}
            placeholder="Primary phrase"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-secondaryKeywords">Secondary keywords</Label>
          <Input
            id="seo-secondaryKeywords"
            value={value.secondaryKeywords}
            onChange={(e) => set("secondaryKeywords", e.target.value)}
            placeholder="Comma-separated"
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
        <div className="space-y-2">
          <Label>Schema type</Label>
          <Select
            value={value.schemaType || undefined}
            onValueChange={(v) => set("schemaType", v === "_none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select schema…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None</SelectItem>
              {SCHEMA_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-breadcrumb">Breadcrumb label</Label>
          <Input
            id="seo-breadcrumb"
            value={value.breadcrumbLabel}
            onChange={(e) => set("breadcrumbLabel", e.target.value)}
            placeholder="Short nav label"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-jsonld">Custom JSON-LD</Label>
            {jsonError && (
              <span className="font-mono text-xs text-destructive">{jsonError}</span>
            )}
            {!jsonError && value.structuredData.trim() && (
              <span className="font-mono text-xs text-emerald-600">Valid JSON</span>
            )}
          </div>
          <Textarea
            id="seo-jsonld"
            value={value.structuredData}
            onChange={(e) => onStructuredDataChange(e.target.value)}
            rows={4}
            className="font-mono text-xs"
            placeholder='{"@context":"https://schema.org","@type":"…"}'
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.robotsIndex} onCheckedChange={(v) => set("robotsIndex", v)} />
          <Label>Index</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.robotsFollow} onCheckedChange={(v) => set("robotsFollow", v)} />
          <Label>Follow</Label>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Switch
            checked={value.includeInSitemap}
            onCheckedChange={(v) => set("includeInSitemap", v)}
          />
          <Label>Include in sitemap</Label>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        SEO warnings are advisory — they do not block publish.
      </p>
    </Card>
  );
}

export const SeoPanel = EntitySeoFields;
