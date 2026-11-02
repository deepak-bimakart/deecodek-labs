"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Submission = {
  id: string;
  name: string;
  email: string;
  service: string | null;
  budget: string | null;
  message: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  notes: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string | null; email: string } | null;
  }>;
};

const STATUS_TONES: Record<string, string> = {
  NEW: "bg-red-500/15 text-red-700 dark:text-red-400",
  READ: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  IN_PROGRESS: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  REPLIED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CLOSED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  SPAM: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

export function ContactDetail({ submission }: { submission: Submission }) {
  const [status, setStatus] = useState(submission.status);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(submission.notes);
  const [savingStatus, setSavingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/contact/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Status: ${newStatus.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update status");
      setStatus(submission.status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/contact/${submission.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note }),
      });
      if (!res.ok) throw new Error("Failed");
      const { note: newNote } = await res.json();
      setNotes([newNote, ...notes]);
      setNote("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card className="p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Message</p>
          <p className="mt-3 text-pretty whitespace-pre-line text-foreground">
            {submission.message}
          </p>
        </Card>

        <Card className="p-5">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Notes ({notes.length})
          </p>
          <div className="mb-4 space-y-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note (not visible to the submitter)..."
              className="min-h-[80px]"
            />
            <Button onClick={addNote} disabled={addingNote || !note.trim()} size="sm">
              {addingNote ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-3.5 w-3.5" /> Add note
                </>
              )}
            </Button>
          </div>
          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No notes yet.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {n.author?.name ?? n.author?.email ?? "system"} ·{" "}
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="space-y-4 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Details</p>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={updateStatus} disabled={savingStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REPLIED">Replied</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Service</p>
            <p className="text-sm">{submission.service ?? "—"}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Budget</p>
            <p className="text-sm">{submission.budget ?? "—"}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Submitted</p>
            <p className="text-sm">{new Date(submission.createdAt).toLocaleString()}</p>
          </div>

          {submission.ipAddress && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">IP</p>
              <p className="font-mono text-xs">{submission.ipAddress}</p>
            </div>
          )}

          {submission.userAgent && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">User agent</p>
              <p className="font-mono text-[10px] break-all text-muted-foreground">{submission.userAgent}</p>
            </div>
          )}
        </Card>

        <a
          href={`mailto:${submission.email}?subject=Re: Your inquiry to DeeCodeK Labs&body=Hi ${submission.name},%0D%0A%0D%0AThanks for reaching out. %0D%0A%0D%0A`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          <Send className="h-3.5 w-3.5" /> Reply via email
        </a>
      </div>
    </div>
  );
}
