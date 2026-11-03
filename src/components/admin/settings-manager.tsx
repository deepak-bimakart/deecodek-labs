"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationEditor } from "@/components/admin/navigation-editor";
import type { SocialLink } from "@/lib/social-links";

const HASH_TO_TAB: Record<string, string> = {
  navigation: "navigation",
  footer: "navigation",
  theme: "theme",
  social: "social",
  faqs: "content",
  testimonials: "content",
  analytics: "analytics",
  opensource: "opensource",
  seo: "seo",
};

type NavMenu = {
  id: string;
  name: string;
  slug: string;
  items: Array<{
    id: string;
    label: string;
    url: string;
    sortOrder: number;
    isButton: boolean;
    isNewTab: boolean;
  }>;
};

type ListHeroFields = { eyebrow: string; title: string; subtitle: string };

const LIST_HERO_KEYS = [
  { key: "products", label: "Products" },
  { key: "work", label: "Work / Portfolio" },
  { key: "blog", label: "Blog" },
  { key: "services", label: "Services" },
] as const;

function newSocialId() {
  return `social_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function SettingsManager({
  initialSettings,
  navMenus,
}: {
  initialSettings: Record<string, any>;
  navMenus: NavMenu[];
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("general");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && HASH_TO_TAB[hash]) setTab(HASH_TO_TAB[hash]);
  }, []);

  const socialLinks: SocialLink[] = Array.isArray(settings["social.links"])
    ? settings["social.links"]
    : [];

  function update(key: string, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setSocialLinks(links: SocialLink[]) {
    update("social.links", links);
    // Keep legacy keys in sync for older consumers
    const byIcon = (icon: string) => links.find((l) => l.icon === icon)?.url ?? "";
    update("social.github", byIcon("github"));
    update("social.linkedin", byIcon("linkedin"));
    update("social.twitter", byIcon("twitter") || byIcon("x"));
  }

  function getListHero(key: string): ListHeroFields {
    const raw = settings[`listHero.${key}`];
    if (raw && typeof raw === "object") {
      return {
        eyebrow: raw.eyebrow ?? "",
        title: raw.title ?? "",
        subtitle: raw.subtitle ?? "",
      };
    }
    return { eyebrow: "", title: "", subtitle: "" };
  }

  function setListHero(key: string, patch: Partial<ListHeroFields>) {
    update(`listHero.${key}`, { ...getListHero(key), ...patch });
  }

  async function saveAll() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="list-heroes">List pages</TabsTrigger>
          <TabsTrigger value="opensource">Open Source</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="content">FAQs & Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Brand name</Label>
                <Input
                  value={settings["brand.name"] ?? ""}
                  onChange={(e) => update("brand.name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input
                  value={settings["brand.tagline"] ?? ""}
                  onChange={(e) => update("brand.tagline", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Contact email</Label>
                <Input
                  type="email"
                  value={settings["brand.email"] ?? ""}
                  onChange={(e) => update("brand.email", e.target.value)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Default theme</Label>
              <Select
                value={settings["theme.default"] ?? "light"}
                onValueChange={(v) => update("theme.default", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light (White + Teal)</SelectItem>
                  <SelectItem value="dark">Dark (Peacock Blue)</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="rounded-md bg-brand-soft p-3 text-xs text-primary">
              Note: per-user theme preference is saved in their browser via <code>next-themes</code>.
              The setting here sets the default for first-time visitors.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Manage social links shown in the footer and public API. Add, remove, or reorder.
            </p>
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_1fr_120px_auto]"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const next = [...socialLinks];
                        next[index] = { ...link, label: e.target.value };
                        setSocialLinks(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const next = [...socialLinks];
                        next[index] = { ...link, url: e.target.value };
                        setSocialLinks(next);
                      }}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Icon</Label>
                    <Select
                      value={link.icon}
                      onValueChange={(v) => {
                        const next = [...socialLinks];
                        next[index] = { ...link, icon: v };
                        setSocialLinks(next);
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter / X</SelectItem>
                        <SelectItem value="link">Generic link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === 0}
                      onClick={() => {
                        if (index === 0) return;
                        const next = [...socialLinks];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        setSocialLinks(next);
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === socialLinks.length - 1}
                      onClick={() => {
                        if (index >= socialLinks.length - 1) return;
                        const next = [...socialLinks];
                        [next[index + 1], next[index]] = [next[index], next[index + 1]];
                        setSocialLinks(next);
                      }}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setSocialLinks([
                  ...socialLinks,
                  { id: newSocialId(), label: "", url: "", icon: "link" },
                ])
              }
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> Add social link
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" id="navigation">
          <NavigationEditor menus={navMenus} />
        </TabsContent>

        <TabsContent value="list-heroes">
          <Card className="space-y-6 p-6">
            <p className="text-sm text-muted-foreground">
              Hero eyebrow, title, and subtitle for public list pages. Keys:{" "}
              <code className="font-mono text-xs">listHero.products</code>,{" "}
              <code className="font-mono text-xs">listHero.work</code>,{" "}
              <code className="font-mono text-xs">listHero.blog</code>,{" "}
              <code className="font-mono text-xs">listHero.services</code>.
            </p>
            {LIST_HERO_KEYS.map(({ key, label }) => {
              const hero = getListHero(key);
              return (
                <div key={key} className="space-y-3 border-t border-border pt-4 first:border-0 first:pt-0">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Eyebrow</Label>
                      <Input
                        value={hero.eyebrow}
                        onChange={(e) => setListHero(key, { eyebrow: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={hero.title}
                        onChange={(e) => setListHero(key, { title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Subtitle</Label>
                      <Textarea
                        value={hero.subtitle}
                        onChange={(e) => setListHero(key, { subtitle: e.target.value })}
                        className="min-h-[72px]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </TabsContent>

        <TabsContent value="opensource" id="opensource">
          <Card className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              SEO metadata for the Open Source playground landing (external or linked page).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>SEO title</Label>
                <Input
                  value={settings["opensource.seo.title"] ?? ""}
                  onChange={(e) => update("opensource.seo.title", e.target.value)}
                  placeholder="Open Source Playground"
                />
                <p className="text-xs text-muted-foreground">
                  Key: <code className="font-mono">opensource.seo.title</code>
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>SEO description</Label>
                <Textarea
                  value={settings["opensource.seo.description"] ?? ""}
                  onChange={(e) => update("opensource.seo.description", e.target.value)}
                  className="min-h-[72px]"
                  placeholder="Small experiments. Useful tools…"
                />
                <p className="text-xs text-muted-foreground">
                  Key: <code className="font-mono">opensource.seo.description</code>
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>OG image URL</Label>
                <Input
                  value={settings["opensource.seo.ogImage"] ?? ""}
                  onChange={(e) => update("opensource.seo.ogImage", e.target.value)}
                  placeholder="https://… or /uploads/…"
                />
                <p className="text-xs text-muted-foreground">
                  Key: <code className="font-mono">opensource.seo.ogImage</code>
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" id="analytics">
          <Card className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Optional tracking scripts injected on public pages only (not under{" "}
              <code className="font-mono text-xs">/admin</code>). Leave blank to disable.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Google Analytics ID</Label>
                <Input
                  value={settings["analytics.gaId"] ?? ""}
                  onChange={(e) => update("analytics.gaId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Key: <code className="font-mono">analytics.gaId</code>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Plausible domain</Label>
                <Input
                  value={settings["analytics.plausibleDomain"] ?? ""}
                  onChange={(e) => update("analytics.plausibleDomain", e.target.value)}
                  placeholder="deecodeklabs.com"
                />
                <p className="text-xs text-muted-foreground">
                  Key: <code className="font-mono">analytics.plausibleDomain</code>
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seo" id="seo">
          <Card className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Global SEO defaults used by the root layout and public metadata. Entity-level SEO
              still overrides per page.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Site name</Label>
                <Input
                  value={settings["seo.siteName"] ?? ""}
                  onChange={(e) => update("seo.siteName", e.target.value)}
                  placeholder="DeeCodeK Labs"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Title template</Label>
                <Input
                  value={settings["seo.titleTemplate"] ?? ""}
                  onChange={(e) => update("seo.titleTemplate", e.target.value)}
                  placeholder="%s · DeeCodeK Labs"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Default meta description</Label>
                <Textarea
                  value={settings["seo.defaultDescription"] ?? ""}
                  onChange={(e) => update("seo.defaultDescription", e.target.value)}
                  className="min-h-[72px]"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Default OG image URL</Label>
                <Input
                  value={settings["seo.defaultOgImage"] ?? ""}
                  onChange={(e) => update("seo.defaultOgImage", e.target.value)}
                  placeholder="/logo-light.png"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Organization address</Label>
                <Input
                  value={settings["seo.orgAddress"] ?? ""}
                  onChange={(e) => update("seo.orgAddress", e.target.value)}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Organization email</Label>
                <Input
                  type="email"
                  value={settings["seo.orgEmail"] ?? settings["brand.email"] ?? ""}
                  onChange={(e) => update("seo.orgEmail", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Google Search Console verification</Label>
                <Input
                  value={settings["seo.verification.google"] ?? ""}
                  onChange={(e) => update("seo.verification.google", e.target.value)}
                  placeholder="content token from meta tag"
                />
                <p className="text-xs text-muted-foreground">
                  Key: <code className="font-mono">seo.verification.google</code>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Bing Webmaster verification</Label>
                <Input
                  value={settings["seo.verification.bing"] ?? ""}
                  onChange={(e) => update("seo.verification.bing", e.target.value)}
                  placeholder="msvalidate.01 token"
                />
                <p className="text-xs text-muted-foreground">
                  Key: <code className="font-mono">seo.verification.bing</code>
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Default robots notes</Label>
                <Textarea
                  value={settings["seo.robotsNotes"] ?? ""}
                  onChange={(e) => update("seo.robotsNotes", e.target.value)}
                  className="min-h-[72px]"
                  placeholder="Internal notes for robots / crawl policy (not emitted publicly)."
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              FAQs and testimonials now have dedicated admin list pages with full-page editors.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/faqs">
                  Manage FAQs <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/testimonials">
                  Manage testimonials <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveAll} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save all settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
