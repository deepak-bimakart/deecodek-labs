import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const bodySchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(1000).nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    let path = parsed.data.path.split("?")[0] || "/";
    if (!path.startsWith("/")) path = `/${path}`;
    // Ignore admin / API noise
    if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const referrer = parsed.data.referrer?.trim() || null;

    await db.notFoundHit.upsert({
      where: { path },
      create: {
        path,
        count: 1,
        lastReferrer: referrer,
      },
      update: {
        count: { increment: 1 },
        lastReferrer: referrer,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Schema may not be pushed yet — fail soft
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
