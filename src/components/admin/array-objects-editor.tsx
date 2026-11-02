"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerInput } from "@/components/admin/media-picker-input";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "list" | "media";
  placeholder?: string;
};

export function ArrayOfObjectsEditor({
  items,
  onChange,
  fields,
}: {
  items: Record<string, any>[];
  onChange: (items: Record<string, any>[]) => void;
  fields: FieldDef[];
}) {
  function update(index: number, key: string, value: any) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function add() {
    const newItem: Record<string, any> = {};
    for (const f of fields) {
      newItem[f.key] = f.type === "list" ? [] : "";
    }
    onChange([...items, newItem]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-border p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Item {i + 1}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-xs text-muted-foreground">{f.label}</label>
              {f.type === "text" && (
                <Input
                  value={item[f.key] ?? ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
              {f.type === "textarea" && (
                <Textarea
                  value={item[f.key] ?? ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="min-h-[60px]"
                />
              )}
              {f.type === "media" && (
                <MediaPickerInput
                  value={item[f.key] ?? ""}
                  onChange={(v) => update(i, f.key, v)}
                />
              )}
              {f.type === "list" && (
                <Textarea
                  value={(item[f.key] ?? []).join("\n")}
                  onChange={(e) =>
                    update(
                      i,
                      f.key,
                      e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder={f.placeholder ?? "One item per line"}
                  className="min-h-[80px] font-mono text-xs"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="mr-2 h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  );
}
