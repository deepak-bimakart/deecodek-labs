import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const projectSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  repoUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  stars: z.number().int().default(0),
  forks: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(["active", "archived", "wip"]).default("active"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const setting = await db.siteSetting.findUnique({ where: { key: "opensource.projects" } });
  let projects: any[] = [];
  if (setting) {
    try {
      projects = JSON.parse(setting.value);
    } catch {}
  }

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const setting = await db.siteSetting.findUnique({ where: { key: "opensource.projects" } });
  let projects: any[] = [];
  if (setting) {
    try { projects = JSON.parse(setting.value); } catch {}
  }

  const newProject = {
    id: `oss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  projects.push(newProject);
  await db.siteSetting.upsert({
    where: { key: "opensource.projects" },
    update: { value: JSON.stringify(projects) },
    create: { key: "opensource.projects", value: JSON.stringify(projects) },
  });

  await audit({ action: "create", entityType: "opensource_project", entityId: newProject.id, userId: user.id, metadata: { name: newProject.name } });

  return NextResponse.json({ project: newProject }, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { projects } = body as { projects: any[] };

  await db.siteSetting.upsert({
    where: { key: "opensource.projects" },
    update: { value: JSON.stringify(projects) },
    create: { key: "opensource.projects", value: JSON.stringify(projects) },
  });

  await audit({ action: "update", entityType: "opensource_projects", userId: user.id, metadata: { count: projects.length } });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "settings.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const setting = await db.siteSetting.findUnique({ where: { key: "opensource.projects" } });
  let projects: any[] = [];
  if (setting) {
    try { projects = JSON.parse(setting.value); } catch {}
  }

  const filtered = projects.filter((p) => p.id !== id);
  await db.siteSetting.upsert({
    where: { key: "opensource.projects" },
    update: { value: JSON.stringify(filtered) },
    create: { key: "opensource.projects", value: JSON.stringify(filtered) },
  });

  await audit({ action: "delete", entityType: "opensource_project", entityId: id, userId: user.id });

  return NextResponse.json({ ok: true });
}
