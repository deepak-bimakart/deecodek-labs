import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, can } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.view") && !can(user.role, "settings.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const hits = await db.notFoundHit.findMany({
      orderBy: [{ count: "desc" }, { updatedAt: "desc" }],
      take: 200,
    });
    return NextResponse.json({ hits });
  } catch {
    return NextResponse.json({ hits: [], error: "NotFoundHit table unavailable" });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "seo.manage") && !can(user.role, "settings.update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await db.notFoundHit.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
