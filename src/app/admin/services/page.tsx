import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminServicesList } from "@/components/admin/admin-services-list";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await db.service.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.length} services · 6 categories seeded
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" /> New service
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No services yet.</p>
          </div>
        ) : (
          <AdminServicesList services={services} />
        )}
      </Card>
    </div>
  );
}
