import { db } from "@/lib/db";

export type SlugEntityKind = "blog" | "service" | "product" | "project" | "page";

const PATH_PREFIX: Record<SlugEntityKind, string> = {
  blog: "/blog",
  service: "/services",
  product: "/products",
  project: "/work",
  page: "",
};

function publicPath(kind: SlugEntityKind, slug: string): string {
  const prefix = PATH_PREFIX[kind];
  const clean = slug.replace(/^\/+/, "");
  return prefix ? `${prefix}/${clean}` : `/${clean}`;
}

/** When a published entity's slug changes, create/refresh a 301 redirect. */
export async function createSlugChangeRedirect(opts: {
  kind: SlugEntityKind;
  oldSlug: string;
  newSlug: string;
  isPublic: boolean;
}): Promise<void> {
  const { kind, oldSlug, newSlug, isPublic } = opts;
  if (!isPublic) return;
  if (!oldSlug || !newSlug || oldSlug === newSlug) return;

  const fromPath = publicPath(kind, oldSlug);
  const toPath = publicPath(kind, newSlug);
  if (fromPath === toPath) return;

  await db.redirect.upsert({
    where: { fromPath },
    create: { fromPath, toPath, statusCode: 301, isActive: true },
    update: { toPath, statusCode: 301, isActive: true },
  });
}
