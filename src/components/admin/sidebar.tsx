"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Navigation,
  PanelBottom,
  ImageIcon,
  Wrench,
  Boxes,
  FolderKanban,
  Quote,
  HelpCircle,
  Newspaper,
  Mail,
  Search,
  Palette,
  Settings,
  Github,
  ExternalLink,
  UserRound,
  ArrowRightLeft,
  ScrollText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ label: string; href: string; icon: typeof LayoutDashboard }>;
}> = [
  {
    label: "",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { label: "Pages", href: "/admin/pages", icon: FileText },
      { label: "Sections", href: "/admin/pages", icon: Layers },
      { label: "Navigation", href: "/admin/settings#navigation", icon: Navigation },
      { label: "Footer", href: "/admin/settings#footer", icon: PanelBottom },
      { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "Products", href: "/admin/products", icon: Boxes },
      { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    ],
  },
  {
    label: "Publishing",
    items: [
      { label: "Blog Posts", href: "/admin/blog", icon: Newspaper },
    ],
  },
  {
    label: "Communication",
    items: [{ label: "Contact Submissions", href: "/admin/contact", icon: Mail }],
  },
  {
    label: "Open Source",
    items: [
      { label: "OSS Projects", href: "/admin/opensource", icon: Github },
      { label: "View OSS Site", href: "https://opensource.deecodeklabs.com", icon: ExternalLink },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "SEO Settings", href: "/admin/seo", icon: Search },
      { label: "Redirects", href: "/admin/redirects", icon: ArrowRightLeft },
      { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
      { label: "Theme Settings", href: "/admin/settings#theme", icon: Palette },
      { label: "Analytics", href: "/admin/settings#analytics", icon: BarChart3 },
      { label: "General Settings", href: "/admin/settings", icon: Settings },
      { label: "Account", href: "/admin/account", icon: UserRound },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
      <nav className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin px-3 py-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-6" : ""}>
            {group.label && (
              <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isExternal = item.href.startsWith("http");
                const active =
                  !isExternal &&
                  (pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href.split("#")[0]) && item.href !== "/admin/settings"));
                const isExactActive = !isExternal && pathname === item.href;
                const linkProps = isExternal
                  ? { href: item.href, target: "_blank", rel: "noreferrer" }
                  : { href: item.href };
                return (
                  <li key={item.href + item.label}>
                    <Link
                      {...linkProps}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        isExactActive || (active && item.href !== "/admin/settings")
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
