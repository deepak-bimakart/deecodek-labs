import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const menus = await db.navigationMenu.findMany({
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ menus });
}

const createItemSchema = z.object({
  menuId: z.string().min(1),
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(500),
  sortOrder: z.number().int().optional(),
  isNewTab: z.boolean().optional(),
  isButton: z.boolean().optional(),
  parentId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const menu = await db.navigationMenu.findUnique({ where: { id: parsed.data.menuId } });
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

  const maxOrder = await db.navigationItem.aggregate({
    where: { menuId: parsed.data.menuId },
    _max: { sortOrder: true },
  });

  const item = await db.navigationItem.create({
    data: {
      menuId: parsed.data.menuId,
      label: parsed.data.label,
      url: parsed.data.url,
      isNewTab: parsed.data.isNewTab ?? false,
      isButton: parsed.data.isButton ?? false,
      parentId: parsed.data.parentId ?? null,
      sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await audit({ action: "create", entityType: "navigation_item", entityId: item.id, userId: user.id });
  return NextResponse.json({ item }, { status: 201 });
}

const reorderSchema = z.object({
  menuId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { menuId, orderedIds } = parsed.data;
  await db.$transaction(
    orderedIds.map((id, index) =>
      db.navigationItem.updateMany({
        where: { id, menuId },
        data: { sortOrder: index },
      })
    )
  );

  await audit({
    action: "reorder",
    entityType: "navigation_menu",
    entityId: menuId,
    userId: user.id,
    metadata: { count: orderedIds.length },
  });

  return NextResponse.json({ ok: true });
}
