"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Pair = { label: string; value: string };

export function KeyValueListEditor({
  items,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: {
  items: Array<{ label: string; value: string } | { [k: string]: string }>;
  onChange: (items: Pair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  // Normalize input to {label, value}
  const normalized: Pair[] = items.map((it: any) => {
    if (it && typeof it === "object" && "label" in it) {
      return { label: it.label ?? "", value: it.value ?? "" };
    }
    // Fallback for legacy {key, value} or other shapes
    const keys = Object.keys(it);
    if (keys.length >= 2) {
      return { label: it[keys[0]] ?? "", value: it[keys[1]] ?? "" };
    }
    return { label: "", value: "" };
  });

  function update(index: number, field: "label" | "value", value: string) {
    const next = [...normalized];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function add() {
    onChange([...normalized, { label: "", value: "" }]);
  }

  function remove(index: number) {
    onChange(normalized.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {normalized.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={pair.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1"
          />
          <Input
            value={pair.value}
            onChange={(e) => update(i, "value", e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => remove(i)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="mr-2 h-3.5 w-3.5" /> Add row
      </Button>
    </div>
  );
}
