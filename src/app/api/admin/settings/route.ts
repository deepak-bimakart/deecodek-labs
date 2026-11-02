import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

// GET /api/admin/settings — list all settings
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await db.siteSetting.findMany();
  const map: Record<string, any> = {};
  for (const s of settings) {
    try {
      map[s.key] = JSON.parse(s.value);
    } catch {
      map[s.key] = s.value;
    }
  }
  return NextResponse.json({ settings: map });
}

// PATCH /api/admin/settings — bulk update
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as Record<string, any>;
  const updated: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    const encoded = typeof value === "string" ? value : JSON.stringify(value);
    await db.siteSetting.upsert({
      where: { key },
      update: { value: encoded },
      create: { key, value: encoded },
    });
    updated.push(key);
  }

  await audit({
    action: "update",
    entityType: "settings",
    userId: user.id,
    metadata: { keys: updated },
  });

  return NextResponse.json({ ok: true, updated });
}
