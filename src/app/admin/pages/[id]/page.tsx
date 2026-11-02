import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageBuilder } from "@/components/admin/page-builder";

export const dynamic = "force-dynamic";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      seo: true,
    },
  });

  if (!page) notFound();

  return <PageBuilder initialPage={page} />;
}
