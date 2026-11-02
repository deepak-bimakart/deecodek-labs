import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const noteSchema = z.object({
  content: z.string().min(1).max(2000),
});

// POST /api/admin/contact/[id]/notes
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "contact.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: submissionId } = await params;
  const body = await req.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const note = await db.contactNote.create({
    data: {
      submissionId,
      authorId: user.id,
      content: parsed.data.content,
    },
    include: { author: { select: { name: true, email: true } } },
  });

  await audit({ action: "note", entityType: "contact", entityId: submissionId, userId: user.id });
  return NextResponse.json({ note }, { status: 201 });
}
