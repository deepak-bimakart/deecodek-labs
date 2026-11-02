import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, can } from "@/lib/rbac";

// GET /api/admin/contact/export — CSV export of all submissions
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "contact.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const submissions = await db.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Submitted At", "Name", "Email", "Service", "Budget", "Status", "Message"];
  const escape = (s: string | null | undefined) => {
    if (s == null) return "";
    const str = String(s);
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = submissions.map((s) => [
    s.createdAt.toISOString(),
    s.name,
    s.email,
    s.service ?? "",
    s.budget ?? "",
    s.status,
    s.message,
  ].map(escape).join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contact-submissions-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
