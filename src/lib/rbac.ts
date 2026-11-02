import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user!;
}

export async function requireRole(roles: Role | Role[]) {
  const user = await requireAuth();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) {
    redirect("/admin?error=forbidden");
  }
  return user;
}

// Permission matrix
export const PERMISSIONS: Record<string, Role[]> = {
  "pages.view": ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"],
  "pages.create": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "pages.update": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "pages.delete": ["SUPER_ADMIN", "ADMIN"],
  "pages.publish": ["SUPER_ADMIN", "ADMIN"],
  "services.view": ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"],
  "services.create": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "services.update": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "services.delete": ["SUPER_ADMIN", "ADMIN"],
  "products.view": ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"],
  "products.create": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "products.update": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "products.delete": ["SUPER_ADMIN", "ADMIN"],
  "projects.view": ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"],
  "projects.create": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "projects.update": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "projects.delete": ["SUPER_ADMIN", "ADMIN"],
  "blog.view": ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"],
  "blog.create": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "blog.update": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "blog.delete": ["SUPER_ADMIN", "ADMIN"],
  "blog.publish": ["SUPER_ADMIN", "ADMIN"],
  "media.view": ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"],
  "media.upload": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "media.update": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "media.delete": ["SUPER_ADMIN", "ADMIN"],
  "contact.view": ["SUPER_ADMIN", "ADMIN"],
  "contact.update": ["SUPER_ADMIN", "ADMIN"],
  "contact.delete": ["SUPER_ADMIN"],
  "settings.view": ["SUPER_ADMIN", "ADMIN", "VIEWER"],
  "settings.update": ["SUPER_ADMIN", "ADMIN"],
  "users.view": ["SUPER_ADMIN", "ADMIN"],
  "users.create": ["SUPER_ADMIN"],
  "users.update": ["SUPER_ADMIN"],
  "users.delete": ["SUPER_ADMIN"],
} as const;

export function can(role: Role | undefined, permission: string): boolean {
  if (!role) return false;
  const allowed = PERMISSIONS[permission];
  return allowed ? allowed.includes(role) : false;
}

export async function audit({
  action,
  entityType,
  entityId,
  userId,
  metadata,
}: {
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await db.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {}
}
