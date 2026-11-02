import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const testimonialSchema = z.object({
  authorName: z.string().min(1).max(200),
  authorRole: z.string().optional(),
  authorCompany: z.string().optional(),
  avatarUrl: z.string().optional(),
  content: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5).default(5),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("PUBLISHED"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const testimonials = await db.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ testimonials });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const testimonial = await db.testimonial.create({ data: parsed.data });
  await audit({ action: "create", entityType: "testimonial", entityId: testimonial.id, userId: user.id });
  return NextResponse.json({ testimonial }, { status: 201 });
}
