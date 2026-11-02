import { requireAuth } from "@/lib/rbac";
import { AccountPasswordForm } from "@/components/admin/account-password-form";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {user.email}. Change your password below.
        </p>
      </div>
      <AccountPasswordForm />
    </div>
  );
}
