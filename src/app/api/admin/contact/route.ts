import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

// GET /api/admin/contact — list submissions
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "contact.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  const submissions = await db.contactSubmission.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { message: { contains: search } },
        ]
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      notes: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const counts = await db.contactSubmission.groupBy({
    by: ["status"],
    _count: true,
  });

  return NextResponse.json({ submissions, counts });
}
