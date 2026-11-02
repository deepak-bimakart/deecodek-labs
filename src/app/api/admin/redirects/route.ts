import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const redirectSchema = z.object({
  fromPath: z.string().min(1).max(500),
  toPath: z.string().min(1).max(500),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).default(301),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const redirects = await db.redirect.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ redirects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = redirectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const fromPath = parsed.data.fromPath.startsWith("/")
    ? parsed.data.fromPath
    : `/${parsed.data.fromPath}`;

  const existing = await db.redirect.findUnique({ where: { fromPath } });
  if (existing) {
    return NextResponse.json({ error: "A redirect from this path already exists" }, { status: 409 });
  }

  const redirect = await db.redirect.create({
    data: { ...parsed.data, fromPath },
  });
  await audit({ action: "create", entityType: "redirect", entityId: redirect.id, userId: user.id });
  return NextResponse.json({ redirect }, { status: 201 });
}
