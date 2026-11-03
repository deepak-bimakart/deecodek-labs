import { db } from "@/lib/db";

function tokensFrom(...parts: Array<string | null | undefined>): Set<string> {
  const set = new Set<string>();
  for (const part of parts) {
    if (!part) continue;
    for (const t of part.toLowerCase().split(/[^a-z0-9+#.]+/)) {
      if (t.length >= 3) set.add(t);
    }
  }
  return set;
}

function scoreOverlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

/** Match published services to a blog post via title/tags/category/excerpt overlap. */
export async function relatedServicesForPost(input: {
  title: string;
  excerpt?: string | null;
  categoryName?: string | null;
  tagNames?: string[];
  take?: number;
}) {
  const needle = tokensFrom(
    input.title,
    input.excerpt,
    input.categoryName,
    ...(input.tagNames ?? [])
  );
  const services = await db.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      technologies: true,
      isFeatured: true,
    },
  });

  const ranked = services
    .map((s) => {
      let technologies: string[] = [];
      try {
        technologies = JSON.parse(s.technologies ?? "[]");
      } catch {
        technologies = [];
      }
      const hay = tokensFrom(s.title, s.summary, ...technologies);
      return { service: s, score: scoreOverlap(needle, hay) + (s.isFeatured ? 0.25 : 0) };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const take = input.take ?? 3;
  const picked = ranked.slice(0, take).map((r) => r.service);
  if (picked.length >= take) return picked;

  const ids = new Set(picked.map((p) => p.id));
  for (const s of services) {
    if (picked.length >= take) break;
    if (!ids.has(s.id)) picked.push(s);
  }
  return picked;
}

/** Related portfolio + products for a service detail page. */
export async function relatedWorkAndProductsForService(input: {
  title: string;
  summary?: string | null;
  description?: string | null;
  technologies?: string[];
  takeWork?: number;
  takeProducts?: number;
}) {
  const needle = tokensFrom(
    input.title,
    input.summary,
    input.description,
    ...(input.technologies ?? [])
  );

  const [projects, products] = await Promise.all([
    db.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        category: true,
        technologies: true,
        coverImage: true,
        isFeatured: true,
      },
      take: 24,
    }),
    db.product.findMany({
      where: { status: { not: "archived" } },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        summary: true,
        technologies: true,
        coverImage: true,
        isFeatured: true,
      },
      take: 24,
    }),
  ]);

  const rank = <T extends { id: string; isFeatured: boolean; technologies: string }>(
    rows: T[],
    fields: (row: T) => Array<string | null | undefined>
  ) =>
    rows
      .map((row) => {
        let technologies: string[] = [];
        try {
          technologies = JSON.parse(row.technologies ?? "[]");
        } catch {
          technologies = [];
        }
        const hay = tokensFrom(...fields(row), ...technologies);
        return {
          row,
          score: scoreOverlap(needle, hay) + (row.isFeatured ? 0.25 : 0),
        };
      })
      .sort((a, b) => b.score - a.score);

  const takeWork = input.takeWork ?? 3;
  const takeProducts = input.takeProducts ?? 2;

  const workRanked = rank(projects, (p) => [p.name, p.summary, p.category]);
  const productRanked = rank(products, (p) => [p.name, p.tagline, p.summary]);

  const work = (
    workRanked.some((r) => r.score > 0)
      ? workRanked.filter((r) => r.score > 0)
      : workRanked
  )
    .slice(0, takeWork)
    .map((r) => r.row);

  const relatedProducts = (
    productRanked.some((r) => r.score > 0)
      ? productRanked.filter((r) => r.score > 0)
      : productRanked
  )
    .slice(0, takeProducts)
    .map((r) => r.row);

  return { work, products: relatedProducts };
}
