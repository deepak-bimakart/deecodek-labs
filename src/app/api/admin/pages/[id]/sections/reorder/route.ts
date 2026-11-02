import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

// POST /api/admin/pages/[id]/sections/reorder
// body: { orders: [{ id, sortOrder }] }
const reorderSchema = z.object({
  orders: z.array(z.object({
    id: z.string(),
    sortOrder: z.number().int(),
  })),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "pages.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: pageId } = await params;
  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  await db.$transaction(
    parsed.data.orders.map((o) =>
      db.pageSection.update({
        where: { id: o.id },
        data: { sortOrder: o.sortOrder },
      })
    )
  );

  await audit({
    action: "reorder",
    entityType: "sections",
    entityId: pageId,
    userId: user.id,
    metadata: { count: parsed.data.orders.length },
  });

  return NextResponse.json({ ok: true });
}
