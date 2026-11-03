import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  title: {
    default: "Admin",
    template: "%s · Admin · DeeCodeK Labs",
  },
};

// Auth + redirect is handled by middleware (see src/middleware.ts).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminTopbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
