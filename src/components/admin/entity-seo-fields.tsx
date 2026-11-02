"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

export type EntitySeoState = {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
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
  };
}

export function EntitySeoFields({
  value,
  onChange,
}: {
  value: EntitySeoState;
  onChange: (next: EntitySeoState) => void;
}) {
  function set<K extends keyof EntitySeoState>(key: K, v: EntitySeoState[K]) {
    onChange({ ...value, [key]: v });
  }

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
      </div>
    </Card>
  );
}
