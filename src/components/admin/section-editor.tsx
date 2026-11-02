"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SECTION_TYPES, getSectionType } from "@/lib/sections";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { KeyValueListEditor } from "@/components/admin/key-value-editor";
import { ArrayOfObjectsEditor } from "@/components/admin/array-objects-editor";
import { MediaPickerInput } from "@/components/admin/media-picker-input";

type Section = {
  id: string;
  sectionType: string;
  title: string | null;
  content: string;
};

export function SectionEditor({
  section,
  pageId,
  onSave,
  onChange,
  saving,
}: {
  section: Section;
  pageId: string;
  onSave: (content: any, title?: string) => void;
  onChange: (content: any, title?: string) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(section.title ?? "");
  const [content, setContent] = useState<Record<string, any>>(() => {
    try {
      return JSON.parse(section.content) ?? {};
    } catch {
      return {};
    }
  });

  const sectionType = getSectionType(section.sectionType);

  function update(key: string, value: any) {
    const next =
      key === "___root___" && value && typeof value === "object"
        ? { ...value }
        : { ...content, [key]: value };
    setContent(next);
    onChange(next, title);
  }

  function handleSave() {
    onSave(content, title);
  }

  if (!sectionType) {
    return <div className="text-sm text-muted-foreground">Unknown section type.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {sectionType.label}
          </p>
          <p className="text-xs text-muted-foreground">{sectionType.description}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-3.5 w-3.5" /> Save
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="section-title">Section title (internal)</Label>
          <Input
            id="section-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onChange(content, e.target.value);
            }}
            placeholder="e.g. Hero, Capabilities, CTA"
          />
        </div>

        <SectionContentEditor
          type={section.sectionType}
          content={content}
          update={update}
        />
      </div>
    </div>
  );
}

function SectionContentEditor({
  type,
  content,
  update,
}: {
  type: string;
  content: Record<string, any>;
  update: (key: string, value: any) => void;
}) {
  // Render different editors based on section type
  switch (type) {
    case "hero":
    case "split_hero":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Title *">
            <Textarea
              value={content.title ?? ""}
              onChange={(e) => update("title", e.target.value)}
              className="min-h-[80px]"
            />
          </Field>
          <Field label="Subtitle">
            <Textarea
              value={content.subtitle ?? ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="min-h-[80px]"
            />
          </Field>
          <CtaPairEditor content={content} update={update} />
          {type === "hero" && (
            <Field label="Metrics (label / value pairs)">
              <KeyValueListEditor
                items={content.metrics ?? []}
                onChange={(items) => update("metrics", items)}
                keyPlaceholder="Metric label"
                valuePlaceholder="Value"
              />
            </Field>
          )}
          {type === "split_hero" && (
            <>
              <Field label="Image URL">
                <MediaPickerInput
                  value={content.image ?? ""}
                  onChange={(v) => update("image", v)}
                />
              </Field>
              <Field label="Image alt text">
                <Input value={content.imageAlt ?? ""} onChange={(e) => update("imageAlt", e.target.value)} />
              </Field>
              <Field label="Layout">
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={content.layout ?? "right"}
                  onChange={(e) => update("layout", e.target.value)}
                >
                  <option value="right">Image on right</option>
                  <option value="left">Image on left</option>
                </select>
              </Field>
            </>
          )}
        </>
      );

    case "editorial_text":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Heading *">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Paragraphs (one per row)">
            <StringListEditor
              items={content.paragraphs ?? []}
              onChange={(items) => update("paragraphs", items)}
              multiline
              placeholder="Paragraph text"
            />
          </Field>
          <Field label="Stats (label / value)">
            <KeyValueListEditor
              items={content.stats ?? []}
              onChange={(items) => update("stats", items)}
              keyPlaceholder="Stat label"
              valuePlaceholder="Value"
            />
          </Field>
          <Field label="Pull quote (optional)">
            <Textarea value={content.pullQuote ?? ""} onChange={(e) => update("pullQuote", e.target.value)} />
          </Field>
        </>
      );

    case "capabilities_grid":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Heading *">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Subheading">
            <Textarea value={content.subheading ?? ""} onChange={(e) => update("subheading", e.target.value)} />
          </Field>
          <Field label="Items (icon / title / description)">
            <ArrayOfObjectsEditor
              items={content.items ?? []}
              onChange={(items) => update("items", items)}
              fields={[
                { key: "icon", label: "Icon (lucide name)", type: "text", placeholder: "Server" },
                { key: "title", label: "Title", type: "text" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
          </Field>
          <Field label="Columns">
            <Input
              type="number"
              min={1}
              max={4}
              value={content.columns ?? 3}
              onChange={(e) => update("columns", parseInt(e.target.value) || 3)}
            />
          </Field>
        </>
      );

    case "services_list":
    case "product_showcase":
    case "portfolio_grid":
    case "testimonials":
    case "blog_listing":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Heading *">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Subheading">
            <Textarea value={content.subheading ?? ""} onChange={(e) => update("subheading", e.target.value)} />
          </Field>
          <Field label="CTA label">
            <Input value={content.ctaLabel ?? ""} onChange={(e) => update("ctaLabel", e.target.value)} />
          </Field>
          <Field label="CTA URL">
            <Input value={content.ctaHref ?? ""} onChange={(e) => update("ctaHref", e.target.value)} />
          </Field>
          <Field label="Limit (how many items to show)">
            <Input
              type="number"
              value={content.limit ?? 6}
              onChange={(e) => update("limit", parseInt(e.target.value) || 6)}
            />
          </Field>
          {type === "services_list" && (
            <Field label="Show icons">
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={content.showIcons ? "yes" : "no"}
                onChange={(e) => update("showIcons", e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
          )}
          {(type === "portfolio_grid" || type === "testimonials") && (
            <Field label="Featured only">
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={content.featuredOnly ? "yes" : "no"}
                onChange={(e) => update("featuredOnly", e.target.value === "yes")}
              >
                <option value="no">No — show all</option>
                <option value="yes">Yes — featured only</option>
              </select>
            </Field>
          )}
          <p className="rounded-md bg-brand-soft p-3 text-xs text-primary">
            Note: items are auto-populated from the {type.replace("_", " ")} CMS records. Create them in the {type.replace("_", " ")} section of the admin.
          </p>
        </>
      );

    case "tech_stack":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Heading *">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Groups (label + items)">
            <ArrayOfObjectsEditor
              items={content.groups ?? []}
              onChange={(items) => update("groups", items)}
              fields={[
                { key: "label", label: "Group label", type: "text", placeholder: "Backend" },
                { key: "items", label: "Items (one per line)", type: "list" },
              ]}
            />
          </Field>
        </>
      );

    case "process_timeline":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Heading *">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Steps">
            <ArrayOfObjectsEditor
              items={content.steps ?? []}
              onChange={(items) => update("steps", items)}
              fields={[
                { key: "title", label: "Title", type: "text" },
                { key: "duration", label: "Duration", type: "text", placeholder: "1 wk" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
          </Field>
        </>
      );

    case "statistics":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Heading (optional)">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Stats (label / value)">
            <KeyValueListEditor
              items={content.stats ?? []}
              onChange={(items) => update("stats", items)}
              keyPlaceholder="Stat label"
              valuePlaceholder="Value"
            />
          </Field>
        </>
      );

    case "image_gallery":
      return (
        <>
          <Field label="Heading (optional)">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Columns">
            <Input
              type="number"
              min={1}
              max={4}
              value={content.columns ?? 3}
              onChange={(e) => update("columns", parseInt(e.target.value) || 3)}
            />
          </Field>
          <Field label="Images (src / alt / caption)">
            <ArrayOfObjectsEditor
              items={content.images ?? []}
              onChange={(items) => update("images", items)}
              fields={[
                { key: "src", label: "Image URL", type: "media" },
                { key: "alt", label: "Alt text", type: "text" },
                { key: "caption", label: "Caption (optional)", type: "text" },
              ]}
            />
          </Field>
        </>
      );

    case "full_width_image":
      return (
        <>
          <Field label="Image URL">
            <MediaPickerInput
              value={content.src ?? ""}
              onChange={(v) => update("src", v)}
            />
          </Field>
          <Field label="Alt text">
            <Input value={content.alt ?? ""} onChange={(e) => update("alt", e.target.value)} />
          </Field>
          <Field label="Caption (optional)">
            <Input value={content.caption ?? ""} onChange={(e) => update("caption", e.target.value)} />
          </Field>
          <Field label="Overlay">
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={content.overlay ? "yes" : "no"}
              onChange={(e) => update("overlay", e.target.value === "yes")}
            >
              <option value="no">No overlay</option>
              <option value="yes">Dark overlay</option>
            </select>
          </Field>
        </>
      );

    case "cta":
      return (
        <>
          <Field label="Heading *">
            <Textarea value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Subheading">
            <Textarea value={content.subheading ?? ""} onChange={(e) => update("subheading", e.target.value)} />
          </Field>
          <CtaPairEditor content={content} update={update} />
          <Field label="Variant">
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={content.variant ?? "default"}
              onChange={(e) => update("variant", e.target.value)}
            >
              <option value="default">Default (filled)</option>
              <option value="compact">Compact</option>
              <option value="banner">Banner (light)</option>
            </select>
          </Field>
        </>
      );

    case "faq":
      return (
        <>
          <Field label="Eyebrow">
            <Input value={content.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} />
          </Field>
          <Field label="Heading *">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Subheading">
            <Textarea value={content.subheading ?? ""} onChange={(e) => update("subheading", e.target.value)} />
          </Field>
          <Field label="Custom items (leave empty to auto-pull from FAQ CMS)">
            <ArrayOfObjectsEditor
              items={content.items ?? []}
              onChange={(items) => update("items", items)}
              fields={[
                { key: "question", label: "Question", type: "text" },
                { key: "answer", label: "Answer", type: "textarea" },
              ]}
            />
          </Field>
        </>
      );

    case "contact_form":
      return (
        <>
          <Field label="Heading *">
            <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
          </Field>
          <Field label="Subheading">
            <Textarea value={content.subheading ?? ""} onChange={(e) => update("subheading", e.target.value)} />
          </Field>
          <Field label="Show budget field">
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={content.showBudget ? "yes" : "no"}
              onChange={(e) => update("showBudget", e.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Service options (leave empty to auto-pull from Services CMS)">
            <StringListEditor
              items={content.services ?? []}
              onChange={(items) => update("services", items)}
              placeholder="Service name"
            />
          </Field>
        </>
      );

    default:
      return (
        <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No editor for type <code className="font-mono">{type}</code>. Use the raw JSON below.
          <Textarea
            className="mt-3 font-mono text-xs"
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                update("___root___", parsed);
              } catch {}
            }}
            rows={12}
          />
        </div>
      );
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CtaPairEditor({
  content,
  update,
}: {
  content: Record<string, any>;
  update: (key: string, value: any) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5 rounded-md border border-border p-3">
        <p className="text-xs font-medium text-muted-foreground">Primary CTA</p>
        <Input
          placeholder="Label"
          value={content.primaryCta?.label ?? ""}
          onChange={(e) => update("primaryCta", { ...content.primaryCta, label: e.target.value, href: content.primaryCta?.href ?? "" })}
        />
        <Input
          placeholder="URL"
          value={content.primaryCta?.href ?? ""}
          onChange={(e) => update("primaryCta", { ...content.primaryCta, href: e.target.value, label: content.primaryCta?.label ?? "" })}
        />
      </div>
      <div className="space-y-1.5 rounded-md border border-border p-3">
        <p className="text-xs font-medium text-muted-foreground">Secondary CTA</p>
        <Input
          placeholder="Label"
          value={content.secondaryCta?.label ?? ""}
          onChange={(e) => update("secondaryCta", { ...content.secondaryCta, label: e.target.value, href: content.secondaryCta?.href ?? "" })}
        />
        <Input
          placeholder="URL"
          value={content.secondaryCta?.href ?? ""}
          onChange={(e) => update("secondaryCta", { ...content.secondaryCta, href: e.target.value, label: content.secondaryCta?.label ?? "" })}
        />
      </div>
    </div>
  );
}
