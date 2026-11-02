"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function FaqForm({
  mode,
  faqId,
  initial,
}: {
  mode: "create" | "edit";
  faqId?: string;
  initial?: {
    question?: string;
    answer?: string;
    category?: string | null;
    sortOrder?: number;
    status?: string;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "PUBLISHED");

  async function save() {
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || undefined,
        sortOrder,
        status,
      };
      const res = await fetch(
        mode === "create" ? "/api/admin/faqs" : `/api/admin/faqs/${faqId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed");
      await res.json();
      toast.success(mode === "create" ? "FAQ created" : "FAQ updated");
      router.push("/admin/faqs");
      router.refresh();
    } catch {
      toast.error("Failed to save FAQ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl space-y-4 p-6">
      <div className="space-y-1.5">
        <Label>Question *</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Answer *</Label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[140px]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sort order</Label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => router.push("/admin/faqs")}>
          Cancel
        </Button>
        <Button onClick={save} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === "create" ? "Create FAQ" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
