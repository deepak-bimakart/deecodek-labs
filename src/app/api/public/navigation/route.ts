import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const menus = await db.navigationMenu.findMany({
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ menus });
}
