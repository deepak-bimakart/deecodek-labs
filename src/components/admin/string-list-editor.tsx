"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Item = string;

export function StringListEditor({
  items,
  onChange,
  multiline = false,
  placeholder = "",
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function add() {
    onChange([...items, ""]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <GripVertical className="mt-2.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {multiline ? (
            <Textarea
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="min-h-[60px] flex-1"
            />
          ) : (
            <Input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
          )}
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
        <Plus className="mr-2 h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  );
}
