import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ServiceForm } from "@/components/admin/service-form";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await db.service.findUnique({
    where: { id },
    include: { seo: true },
  });
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit: {service.title}
        </h1>
      </div>
      <ServiceForm mode="edit" serviceId={service.id} initial={service} />
    </div>
  );
}
