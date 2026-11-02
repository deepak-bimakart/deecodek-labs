"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  url: string;
  isButton: boolean;
  isNewTab: boolean;
};

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {items
        .filter((i) => !i.isButton)
        .map((item) => {
          const isExternal = item.url.startsWith("http");
          const active =
            !isExternal &&
            (pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url)));
          const linkProps = isExternal
            ? { href: item.url, target: "_blank", rel: "noreferrer" }
            : { href: item.url };
          return (
            <Link
              key={item.id}
              {...linkProps}
              onClick={onNavigate}
              className="group relative px-3 py-2 text-sm transition-colors hover:text-foreground"
            >
              <span
                className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
                {isExternal && <ExternalLink className="h-3 w-3 opacity-60" />}
              </span>
              <span
                className={`absolute inset-x-3 -bottom-px h-px origin-left bg-primary transition-transform duration-300 ${
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
                aria-hidden
              />
            </Link>
          );
        })}
    </>
  );
}

export function ClientHeader({ items, brandName }: { items: NavItem[]; brandName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const buttonItem = items.find((i) => i.isButton);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background,border-color] duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-background/0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/" className="flex items-center" aria-label={brandName}>
            <Logo className="h-9 w-auto sm:h-10" />
          </Link>
        </motion.div>

        <nav className="hidden items-center gap-0.5 md:flex">
          <NavLinks items={items} />
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {buttonItem && (
            <Link
              href={buttonItem.url}
              className="group hidden items-center gap-1.5 border border-primary/30 bg-transparent px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:inline-flex"
            >
              <span>{buttonItem.label}</span>
              <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-border p-0">
              <SheetHeader className="border-b border-border px-6 py-4">
                <SheetTitle className="font-display text-left">{brandName}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 py-6">
                <AnimatePresence>
                  {items.map((item, i) => {
                    const isExternal = item.url.startsWith("http");
                    const linkProps = isExternal
                      ? { href: item.url, target: "_blank", rel: "noreferrer" }
                      : { href: item.url };
                    return (
                      <motion.div
                        key={item.id}
                        initial={reduce ? false : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 + i * 0.04, duration: 0.3 }}
                      >
                        <Link
                          {...linkProps}
                          onClick={() => setOpen(false)}
                          className={
                            item.isButton
                              ? "mt-2 inline-flex items-center gap-1.5 bg-primary px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground"
                              : "inline-flex items-center gap-1.5 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                          }
                        >
                          {item.label}
                          {item.isButton && <ArrowUpRight className="h-3.5 w-3.5" />}
                          {isExternal && <ExternalLink className="h-3.5 w-3.5" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
