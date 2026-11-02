import { getCurrentUser } from "@/lib/rbac";

/** True when `?preview=1` (or `true`) is present. */
export function wantsPreview(
  searchParams: { preview?: string | string[] } | undefined | null
): boolean {
  if (!searchParams) return false;
  const raw = searchParams.preview;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "1" || value === "true";
}

/** Admin session present (any authenticated admin role). */
export async function isAdminPreviewSession(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user?.id;
}

/**
 * Allow viewing non-published content when preview query + admin session.
 * Returns `{ allow, isPreview }` for detail pages.
 */
export async function resolveContentAccess(opts: {
  isPublished: boolean;
  searchParams?: { preview?: string | string[] } | null;
}): Promise<{ allow: boolean; isPreview: boolean }> {
  if (opts.isPublished) {
    return { allow: true, isPreview: false };
  }
  const preview = wantsPreview(opts.searchParams);
  if (!preview) return { allow: false, isPreview: false };
  const admin = await isAdminPreviewSession();
  return { allow: admin, isPreview: admin };
}
