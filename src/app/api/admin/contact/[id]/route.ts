import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const submissionUpdateSchema = z.object({
  status: z.enum(["NEW", "READ", "IN_PROGRESS", "REPLIED", "CLOSED", "SPAM"]).optional(),
  assignedToId: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "contact.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const submission = await db.contactSubmission.findUnique({
    where: { id },
    include: {
      notes: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark as READ if currently NEW
  if (submission.status === "NEW") {
    await db.contactSubmission.update({ where: { id }, data: { status: "READ" } });
    await audit({ action: "read", entityType: "contact", entityId: id, userId: user.id });
    return NextResponse.json({ submission: { ...submission, status: "READ" } });
  }

  return NextResponse.json({ submission });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "contact.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = submissionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const submission = await db.contactSubmission.update({
    where: { id },
    data: parsed.data,
  });
  await audit({ action: "update", entityType: "contact", entityId: id, userId: user.id, metadata: parsed.data });
  return NextResponse.json({ submission });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "contact.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.contactSubmission.delete({ where: { id } });
  await audit({ action: "delete", entityType: "contact", entityId: id, userId: user.id });
  return NextResponse.json({ ok: true });
}
