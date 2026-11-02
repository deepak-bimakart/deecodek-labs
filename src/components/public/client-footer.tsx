"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Twitter, Link2, ArrowUpRight, ArrowUp, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { SocialLink as SocialLinkItem } from "@/lib/social-links";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  link: Link2,
};

type NavItem = {
  id: string;
  label: string;
  url: string;
  isNewTab?: boolean;
};

function NavLink({ item }: { item: NavItem }) {
  const external = item.url.startsWith("http");
  return (
    <Link
      href={item.url}
      {...(external || item.isNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group relative inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span>{item.label}</span>
      <span
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden
      />
    </Link>
  );
}

function SocialAnchor({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    if (reduce) window.scrollTo(0, 0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center border border-border bg-background/90 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? {} : { opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function ClientFooter({
  items,
  brandName,
  tagline,
  email,
  social,
}: {
  items: NavItem[];
  brandName: string;
  tagline: string;
  email: string;
  social: {
    links?: SocialLinkItem[];
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}) {
  const links: SocialLinkItem[] =
    social.links && social.links.length > 0
      ? social.links
      : ([
          social.github && { id: "github", label: "GitHub", url: social.github, icon: "github" },
          social.linkedin && {
            id: "linkedin",
            label: "LinkedIn",
            url: social.linkedin,
            icon: "linkedin",
          },
          social.twitter && { id: "twitter", label: "Twitter", url: social.twitter, icon: "twitter" },
        ].filter(Boolean) as SocialLinkItem[]);

  return (
    <>
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="mb-12 border-b border-border pb-10">
            <p className="story-chapter-eyebrow mb-4">
              <span className="story-chapter-index">∞</span>
              <span className="story-chapter-divider" />
              <span className="story-chapter-label">END MATTER</span>
            </p>
            <Link href="/" className="group inline-flex items-center">
              <Image
                src="/logo-light.png"
                alt={`${brandName} — Software Studio. Product Lab.`}
                width={140}
                height={108}
                className="h-auto w-auto dark:hidden"
                style={{ maxHeight: "56px" }}
              />
              <Image
                src="/logo-dark.png"
                alt={`${brandName} — Software Studio. Product Lab.`}
                width={140}
                height={108}
                className="hidden h-auto w-auto dark:block"
                style={{ maxHeight: "56px" }}
              />
            </Link>
            <p className="mt-4 max-w-md text-muted-foreground">{tagline}</p>
          </div>

          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div className="flex items-center gap-2">
              {links.map((link) => {
                const Icon = SOCIAL_ICONS[link.icon] ?? Link2;
                return (
                  <SocialAnchor key={link.id} href={link.url} label={link.label} icon={Icon} />
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
              <div>
                <p className="mono-label mb-3">Studio</p>
                <ul className="space-y-2.5">
                  {items.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <NavLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mono-label mb-3">Lab</p>
                <ul className="space-y-2.5">
                  {items.slice(4).map((item) => (
                    <li key={item.id}>
                      <NavLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mono-label mb-3">Get in touch</p>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="group relative inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {email}
                      <span
                        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
                        aria-hidden
                      />
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/admin"
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Admin CMS
                      <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mono-label mb-3">Legal</p>
                <ul className="space-y-2.5">
                  <li>
                    <span className="text-sm text-muted-foreground">
                      © {new Date().getFullYear()}
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-muted-foreground">All rights reserved</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
            <p className="text-xs text-muted-foreground">
              {brandName} · Mumbai · Software Studio. Product Lab.
            </p>
            <p className="font-mono text-[10px] tracking-wider text-muted-foreground/70">
              TEAL / PEACOCK
            </p>
          </div>
        </div>
      </footer>
      <BackToTop />
    </>
  );
}
