import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { notifyContactSubmission } from "@/lib/notify-contact";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10).max(5000),
});

// In-memory rate limiting (per IP, 5 submissions / hour)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateMap = new Map<string, { count: number; firstAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = rateMap.get(ip);
  if (!existing || now - existing.firstAt > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(ip, { count: 1, firstAt: now });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX) return false;
  existing.count += 1;
  return true;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

// Simple honeypot — if website (hidden field) is filled, mark as spam
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    // Honeypot
    const honeypot = (body as any)?.website;
    const isSpam = !!honeypot;

    if (!parsed.success && !isSpam) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data!;

    const submission = await db.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        service: data.service ?? null,
        budget: data.budget ?? null,
        message: data.message,
        status: isSpam ? "SPAM" : "NEW",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent")?.slice(0, 500),
      },
    });

    if (!isSpam) {
      // Fire-and-forget; missing env or Resend errors must not fail the save
      void notifyContactSubmission({
        name: submission.name,
        email: submission.email,
        service: submission.service,
        budget: submission.budget,
        message: submission.message,
        submissionId: submission.id,
      });
    }

    return NextResponse.json(
      { ok: true, id: submission.id },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("[contact] Error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
