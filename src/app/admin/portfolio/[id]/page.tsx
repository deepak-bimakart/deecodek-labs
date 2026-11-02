import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProjectForm } from "@/components/admin/project-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: { seo: true },
  });
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit: {project.name}
        </h1>
      </div>
      <ProjectForm mode="edit" projectId={project.id} initial={project} />
    </div>
  );
}
