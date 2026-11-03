import Link from "next/link";
import type { Metadata } from "next";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PublicShell>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">404</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
            This page doesn&apos;t exist.
          </h1>
          <p className="mt-4 text-muted-foreground">
            The URL may have moved, or it was never published. Try one of these:
          </p>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm">
            <li>
              <Link href="/" className="text-primary hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" className="text-primary hover:underline">
                Services
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-primary hover:underline">
                Products
              </Link>
            </li>
            <li>
              <Link href="/work" className="text-primary hover:underline">
                Work
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-primary hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-primary hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </PublicShell>
  );
}
