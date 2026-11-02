import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-grid opacity-[0.04]" aria-hidden />
      <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-16 w-auto sm:h-20" />
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
            Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your website content.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Default:{" "}
          <code className="font-mono text-foreground">admin@deecodeklabs.com</code>
          {" / "}
          <code className="font-mono text-foreground">ChangeMe123!</code>
          <br />
          Change this immediately after first login.
        </p>
      </div>
    </div>
  );
}
