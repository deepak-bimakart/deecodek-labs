"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  Save,
  Send,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SECTION_TYPES } from "@/lib/sections";
import { SectionEditor } from "@/components/admin/section-editor";
import {
  EntitySeoFields,
  seoFromInitial,
  seoPayload,
  type EntitySeoState,
} from "@/components/admin/entity-seo-fields";

type Section = {
  id: string;
  sectionType: string;
  title: string | null;
  content: string;
  sortOrder: number;
  isVisible: boolean;
};

type PageData = {
  id: string;
  title: string;
  slug: string;
  status: string;
  isHomepage: boolean;
  sections: Section[];
  seo?: any;
};

function SortableSectionRow({
  section,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
}: {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-md border px-2 py-2 transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
      } ${!section.isVisible ? "opacity-50" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onSelect} className="flex flex-1 items-center gap-2 text-left">
        <ChevronRight className={`h-3 w-3 transition-transform ${isSelected ? "rotate-90" : ""}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {section.title || section.sectionType.replace(/_/g, " ")}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">{section.sectionType}</p>
        </div>
      </button>
      <button
        onClick={onToggleVisibility}
        className="text-muted-foreground hover:text-foreground"
        aria-label={section.isVisible ? "Hide" : "Show"}
      >
        {section.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={onDuplicate}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Duplicate"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PageBuilder({ initialPage }: { initialPage: PageData }) {
  const [page, setPage] = useState<PageData>(initialPage);
  const [sections, setSections] = useState<Section[]>(initialPage.sections);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPage.sections[0]?.id ?? null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingSeo, setSavingSeo] = useState(false);
  const [seo, setSeo] = useState<EntitySeoState>(() => seoFromInitial(initialPage.seo));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Reload sections when page changes
  useEffect(() => {
    setSections(initialPage.sections);
    setSeo(seoFromInitial(initialPage.seo));
  }, [initialPage]);

  async function savePageSeo() {
    setSavingSeo(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo: seoPayload(seo) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      const { page: updated } = await res.json();
      setPage((prev) => ({ ...prev, seo: updated.seo }));
      toast.success("Page SEO saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save SEO");
    } finally {
      setSavingSeo(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newSections = arrayMove(sections, oldIndex, newIndex);
    setSections(newSections);

    // Persist new order
    try {
      const orders = newSections.map((s, i) => ({ id: s.id, sortOrder: i }));
      await fetch(`/api/admin/pages/${page.id}/sections/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      toast.success("Section order saved");
    } catch {
      toast.error("Failed to save order");
    }
  }

  async function addSection(sectionType: string) {
    const sectionTypeDef = SECTION_TYPES.find((t) => t.id === sectionType);
    if (!sectionTypeDef) return;

    const content = sectionTypeDef.defaultContent();
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType,
          title: sectionTypeDef.label,
          content,
          sortOrder: sections.length,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const { section } = await res.json();
      setSections([...sections, section]);
      setSelectedId(section.id);
      setAddDialogOpen(false);
      toast.success(`Added ${sectionTypeDef.label} section`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add section");
    }
  }

  async function updateSection(sectionId: string, content: any, title?: string) {
    // Optimistic update
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, content: JSON.stringify(content), title: title ?? s.title }
          : s
      )
    );
  }

  async function saveSection(sectionId: string, content: any, title?: string) {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/pages/${page.id}/sections/${sectionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, title }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      toast.success("Section saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateSection(sectionId: string) {
    try {
      const res = await fetch(
        `/api/admin/pages/${page.id}/sections/${sectionId}/duplicate`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed");
      const { section } = await res.json();
      setSections([...sections, section]);
      toast.success("Section duplicated");
    } catch {
      toast.error("Failed to duplicate");
    }
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Delete this section? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/pages/${page.id}/sections/${sectionId}`, {
        method: "DELETE",
      });
      const newSections = sections.filter((s) => s.id !== sectionId);
      setSections(newSections);
      if (selectedId === sectionId) {
        setSelectedId(newSections[0]?.id ?? null);
      }
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function toggleVisibility(sectionId: string, current: boolean) {
    try {
      const res = await fetch(
        `/api/admin/pages/${page.id}/sections/${sectionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isVisible: !current }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, isVisible: !current } : s))
      );
    } catch {
      toast.error("Failed");
    }
  }

  async function publishPage() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const { page: updated } = await res.json();
      setPage(updated);
      toast.success("Page published! Revalidating public site...");
    } catch {
      toast.error("Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  const selectedSection = sections.find((s) => s.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {page.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            /{page.slug} ·{" "}
            <Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"} className="font-mono text-[10px]">
              {page.status}
            </Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${page.slug === "home" ? "" : page.slug}`} target="_blank">
              <Eye className="mr-2 h-3.5 w-3.5" /> Preview
            </Link>
          </Button>
          <Button onClick={publishPage} disabled={publishing} size="sm">
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-3.5 w-3.5" /> Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Three-panel editor */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        {/* Left: section list */}
        <Card className="flex h-[calc(100vh-12rem)] flex-col p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Sections ({sections.length})
            </p>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add a section</DialogTitle>
                  <DialogDescription>
                    Pick a section type. Content can be edited after adding.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  {SECTION_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => addSection(t.id)}
                      className="flex items-start gap-3 rounded-md border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <Plus className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {sections.map((section) => (
                    <SortableSectionRow
                      key={section.id}
                      section={section}
                      isSelected={selectedId === section.id}
                      onSelect={() => setSelectedId(section.id)}
                      onDuplicate={() => duplicateSection(section.id)}
                      onDelete={() => deleteSection(section.id)}
                      onToggleVisibility={() =>
                        toggleVisibility(section.id, section.isVisible)
                      }
                    />
                  ))}
                  {sections.length === 0 && (
                    <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      No sections yet. Click + to add one.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </Card>

        {/* Center: content editor */}
        <Card className="min-h-[60vh] p-4">
          {selectedSection ? (
            <SectionEditor
              key={selectedSection.id}
              section={selectedSection}
              pageId={page.id}
              onSave={(content, title) => saveSection(selectedSection.id, content, title)}
              onChange={(content, title) => updateSection(selectedSection.id, content, title)}
              saving={saving}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a section to edit, or add a new one.
            </div>
          )}
        </Card>

        {/* Right: properties + page SEO */}
        <div className="space-y-4">
          <Card className="p-4">
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Properties
            </p>
            {selectedSection ? (
              <SectionProperties
                section={selectedSection}
                pageId={page.id}
                onChange={(patch) => {
                  // save properties
                  fetch(`/api/admin/pages/${page.id}/sections/${selectedSection.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patch),
                  }).then(() => {
                    setSections((prev) =>
                      prev.map((s) =>
                        s.id === selectedSection.id ? { ...s, ...patch } : s
                      )
                    );
                    toast.success("Properties saved");
                  });
                }}
              />
            ) : (
              <p className="text-xs text-muted-foreground">No section selected.</p>
            )}
          </Card>
          <div className="space-y-2">
            <EntitySeoFields value={seo} onChange={setSeo} entityType="page" />
            <Button onClick={savePageSeo} disabled={savingSeo} className="w-full" size="sm">
              {savingSeo ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving SEO...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" /> Save page SEO
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionProperties({
  section,
  pageId,
  onChange,
}: {
  section: Section;
  pageId: string;
  onChange: (patch: Partial<Section>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Section ID</p>
        <p className="font-mono text-xs break-all bg-muted px-2 py-1 rounded">{section.id}</p>
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Type</p>
        <p className="font-mono text-xs">{section.sectionType}</p>
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Visibility</p>
        <Button
          variant={section.isVisible ? "default" : "outline"}
          size="sm"
          onClick={() => onChange({ isVisible: !section.isVisible })}
          className="w-full"
        >
          {section.isVisible ? "Visible on page" : "Hidden"}
        </Button>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Reorder using drag handle in the left panel.
        </p>
      </div>
    </div>
  );
}
