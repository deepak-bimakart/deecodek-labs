"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Redirect = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  createdAt?: string | Date;
};

export function RedirectsManager({ initialRedirects }: { initialRedirects: Redirect[] }) {
  const [redirects, setRedirects] = useState(initialRedirects);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState("301");
  const [adding, setAdding] = useState(false);

  async function addRedirect() {
    if (!fromPath.trim() || !toPath.trim()) {
      toast.error("From and to paths are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPath: fromPath.trim(),
          toPath: toPath.trim(),
          statusCode: Number(statusCode),
          isActive: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      setRedirects((prev) => [data.redirect, ...prev]);
      setFromPath("");
      setToPath("");
      toast.success("Redirect created");
    } catch (e: any) {
      toast.error(e.message || "Failed to create");
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(r: Redirect) {
    try {
      const res = await fetch(`/api/admin/redirects/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      const { redirect } = await res.json();
      setRedirects((prev) => prev.map((x) => (x.id === r.id ? redirect : x)));
    } catch {
      toast.error("Failed to update");
    }
  }

  async function updateField(r: Redirect, patch: Partial<Redirect>) {
    try {
      const res = await fetch(`/api/admin/redirects/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed");
      const { redirect } = await res.json();
      setRedirects((prev) => prev.map((x) => (x.id === r.id ? redirect : x)));
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    }
  }

  async function deleteRedirect(id: string) {
    if (!confirm("Delete this redirect?")) return;
    try {
      const res = await fetch(`/api/admin/redirects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setRedirects((prev) => prev.filter((r) => r.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Add redirect
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
          <div className="space-y-1.5">
            <Label>From path</Label>
            <Input
              value={fromPath}
              onChange={(e) => setFromPath(e.target.value)}
              placeholder="/old-page"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label>To path / URL</Label>
            <Input
              value={toPath}
              onChange={(e) => setToPath(e.target.value)}
              placeholder="/new-page"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={statusCode} onValueChange={setStatusCode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301</SelectItem>
                <SelectItem value="302">302</SelectItem>
                <SelectItem value="307">307</SelectItem>
                <SelectItem value="308">308</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={addRedirect} disabled={adding}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Redirects ({redirects.length})
          </p>
        </div>
        {redirects.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No redirects yet. Active rules are applied by middleware within ~30s.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {redirects.map((r) => (
              <RedirectRow
                key={r.id}
                redirect={r}
                onToggle={() => toggleActive(r)}
                onSave={(patch) => updateField(r, patch)}
                onDelete={() => deleteRedirect(r.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function RedirectRow({
  redirect,
  onToggle,
  onSave,
  onDelete,
}: {
  redirect: Redirect;
  onToggle: () => void;
  onSave: (patch: Partial<Redirect>) => void;
  onDelete: () => void;
}) {
  const [fromPath, setFromPath] = useState(redirect.fromPath);
  const [toPath, setToPath] = useState(redirect.toPath);
  const [statusCode, setStatusCode] = useState(String(redirect.statusCode));

  return (
    <div className="flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[140px] flex-1 space-y-1">
        <Label className="text-xs">From</Label>
        <Input
          value={fromPath}
          onChange={(e) => setFromPath(e.target.value)}
          className="h-8 font-mono text-xs"
        />
      </div>
      <div className="min-w-[140px] flex-1 space-y-1">
        <Label className="text-xs">To</Label>
        <Input
          value={toPath}
          onChange={(e) => setToPath(e.target.value)}
          className="h-8 font-mono text-xs"
        />
      </div>
      <div className="w-24 space-y-1">
        <Label className="text-xs">Code</Label>
        <Select value={statusCode} onValueChange={setStatusCode}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="301">301</SelectItem>
            <SelectItem value="302">302</SelectItem>
            <SelectItem value="307">307</SelectItem>
            <SelectItem value="308">308</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 pb-1">
        <Switch checked={redirect.isActive} onCheckedChange={onToggle} id={`active-${redirect.id}`} />
        <Label htmlFor={`active-${redirect.id}`} className="text-xs text-muted-foreground">
          Active
        </Label>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onSave({
            fromPath,
            toPath,
            statusCode: Number(statusCode) as 301 | 302 | 307 | 308,
          })
        }
      >
        <Save className="mr-2 h-3.5 w-3.5" /> Save
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
