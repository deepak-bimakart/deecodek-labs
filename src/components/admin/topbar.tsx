import Link from "next/link";
import { LogOut, ArrowLeft, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/rbac";
import { signOut } from "@/lib/admin-signout";

export async function AdminTopbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
        </Link>
        <span className="hidden rounded-md bg-sidebar-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-sidebar-accent-foreground sm:inline">
          CMS
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> View site
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight">{user.name ?? user.email}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {user.role.replace("_", " ")}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" />
            </div>
          </div>
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
