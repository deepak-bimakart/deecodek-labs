"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type NavItem = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  isButton: boolean;
  isNewTab: boolean;
};

type NavMenu = {
  id: string;
  name: string;
  slug: string;
  items: NavItem[];
};

function SortableRow({
  item,
  onChange,
  onDelete,
}: {
  item: NavItem;
  onChange: (id: string, patch: Partial<NavItem>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={item.label}
        onChange={(e) => onChange(item.id, { label: e.target.value })}
        className="h-8 min-w-[120px] flex-1"
        placeholder="Label"
      />
      <Input
        value={item.url}
        onChange={(e) => onChange(item.id, { url: e.target.value })}
        className="h-8 min-w-[160px] flex-[1.5] font-mono text-xs"
        placeholder="/path or https://..."
      />
      <div className="flex items-center gap-1.5">
        <Switch
          checked={item.isButton}
          onCheckedChange={(v) => onChange(item.id, { isButton: v })}
          id={`btn-${item.id}`}
        />
        <Label htmlFor={`btn-${item.id}`} className="text-xs text-muted-foreground">
          Button
        </Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch
          checked={item.isNewTab}
          onCheckedChange={(v) => onChange(item.id, { isNewTab: v })}
          id={`tab-${item.id}`}
        />
        <Label htmlFor={`tab-${item.id}`} className="text-xs text-muted-foreground">
          New tab
        </Label>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:text-destructive"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function MenuEditor({ menu: initial }: { menu: NavMenu }) {
  const [items, setItems] = useState(initial.items);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function persistOrder(next: NavItem[]) {
    setItems(next);
    const res = await fetch("/api/admin/navigation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId: initial.id, orderedIds: next.map((i) => i.id) }),
    });
    if (!res.ok) throw new Error("Reorder failed");
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex).map((i, idx) => ({ ...i, sortOrder: idx }));
    try {
      await persistOrder(next);
      toast.success("Order saved");
    } catch {
      toast.error("Failed to reorder");
    }
  }

  async function saveItem(id: string, patch: Partial<NavItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/navigation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this nav item?")) return;
    try {
      const res = await fetch(`/api/admin/navigation/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function addItem() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: initial.id,
          label: newLabel.trim(),
          url: newUrl.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const { item } = await res.json();
      setItems((prev) => [...prev, item]);
      setNewLabel("");
      setNewUrl("");
      toast.success("Item added");
    } catch {
      toast.error("Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{initial.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">/{initial.slug}</p>
        </div>
        {saving && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving
          </span>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                onChange={(id, patch) => saveItem(id, patch)}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No items yet. Add one below.</p>
      )}

      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <div className="min-w-[140px] flex-1 space-y-1">
          <Label className="text-xs">Label</Label>
          <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="About" />
        </div>
        <div className="min-w-[180px] flex-[1.5] space-y-1">
          <Label className="text-xs">URL</Label>
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="/about"
            className="font-mono text-xs"
          />
        </div>
        <Button size="sm" onClick={addItem} disabled={adding || !newLabel.trim() || !newUrl.trim()}>
          {adding ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
          Add
        </Button>
      </div>
    </div>
  );
}

export function NavigationEditor({ menus }: { menus: NavMenu[] }) {
  return (
    <Card className="space-y-4 p-5">
      <p className="text-sm text-muted-foreground">
        Edit header and footer navigation. Drag to reorder; changes save immediately.
      </p>
      <div className="space-y-4">
        {menus.map((menu) => (
          <MenuEditor key={menu.id} menu={menu} />
        ))}
      </div>
    </Card>
  );
}
