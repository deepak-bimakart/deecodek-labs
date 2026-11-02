import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const redirects = await db.redirect.findMany({
    where: { isActive: true },
    select: { fromPath: true, toPath: true, statusCode: true },
  });
  return NextResponse.json(
    { redirects },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
