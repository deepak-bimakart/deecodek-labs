import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicShell } from "@/components/public/shell";
import { PreviewBadge } from "@/components/public/preview-badge";
import { PageRenderer } from "@/components/sections/renderer";
import { CustomJsonLd } from "@/components/seo-json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { resolveContentAccess, wantsPreview } from "@/lib/preview";

export const revalidate = 60;

async function getHomepage(allowDraft: boolean) {
  const include = {
    sections: { orderBy: { sortOrder: "asc" as const } },
    seo: true,
  };

  if (allowDraft) {
    const draftHome = await db.page.findFirst({
      where: { isHomepage: true },
      include,
    });
    if (draftHome) return draftHome;
    return db.page.findUnique({ where: { slug: "home" }, include });
  }

  const page = await db.page.findFirst({
    where: { isHomepage: true, status: "PUBLISHED" },
    include,
  });
  if (page) return page;
  return db.page.findUnique({
    where: { slug: "home" },
    include,
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const preview = wantsPreview(sp);
  const page = await getHomepage(preview);
  const access = await resolveContentAccess({
    isPublished: !!page && page.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!page || !access.allow) {
    return {
      title: "DeeCodeK Labs — Software Studio. Product Lab.",
    };
  }
  return buildPageMetadata(page.seo, {
    title: "DeeCodeK Labs — Software Studio. Product Lab.",
    description:
      "Mumbai, India-based DeeCodeK Labs builds custom software, scalable backends, digital products, and developer tools engineered for real-world use.",
    path: "/",
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const sp = await searchParams;
  const preview = wantsPreview(sp);
  const page = await getHomepage(preview);
  const access = await resolveContentAccess({
    isPublished: !!page && page.status === "PUBLISHED",
    searchParams: sp,
  });
  if (!page || !access.allow) return notFound();

  return (
    <PublicShell>
      {access.isPreview ? <PreviewBadge /> : null}
      <CustomJsonLd raw={page.seo?.structuredData} />
      <PageRenderer sections={page.sections} />
    </PublicShell>
  );
}
