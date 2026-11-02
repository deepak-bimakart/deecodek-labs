import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const OSS_HOSTS = new Set([
  "opensource.deecodeklabs.com",
  "opensource.localhost",
  "opensource.127.0.0.1",
]);

function isOssHost(host: string) {
  const bare = host.split(":")[0].toLowerCase();
  return OSS_HOSTS.has(bare) || bare.startsWith("opensource.");
}

type RedirectRule = { fromPath: string; toPath: string; statusCode: number };

let redirectsCache: { at: number; items: RedirectRule[] } | null = null;
const REDIRECTS_TTL_MS = 30_000;

async function getActiveRedirects(req: NextRequest): Promise<RedirectRule[]> {
  if (redirectsCache && Date.now() - redirectsCache.at < REDIRECTS_TTL_MS) {
    return redirectsCache.items;
  }
  try {
    const url = new URL("/api/public/redirects", req.nextUrl.origin);
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return redirectsCache?.items ?? [];
    const data = (await res.json()) as { redirects?: RedirectRule[] };
    const items = data.redirects ?? [];
    redirectsCache = { at: Date.now(), items };
    return items;
  } catch {
    return redirectsCache?.items ?? [];
  }
}

function matchRedirect(pathname: string, rules: RedirectRule[]): RedirectRule | null {
  for (const rule of rules) {
    if (rule.fromPath === pathname) return rule;
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // Apply CMS redirects for public paths (skip admin/api/static)
  if (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/uploads") &&
    !pathname.includes(".")
  ) {
    const rules = await getActiveRedirects(req);
    const hit = matchRedirect(pathname, rules);
    if (hit) {
      const target = hit.toPath.startsWith("http")
        ? hit.toPath
        : new URL(hit.toPath, req.url).toString();
      return NextResponse.redirect(target, hit.statusCode || 301);
    }
  }

  // Subdomain: opensource.* serves the OSS landing at /
  if (isOssHost(host)) {
    // Keep admin / API / Next internals on the same app
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/uploads") ||
      pathname.includes(".")
    ) {
      // fall through to admin auth below if /admin
    } else if (pathname === "/" || pathname === "") {
      const url = req.nextUrl.clone();
      url.pathname = "/opensource";
      return NextResponse.rewrite(url);
    } else if (!pathname.startsWith("/opensource")) {
      // Keep other public main-site routes reachable if hit via subdomain
      // but prefer OSS as home — no rewrite for nested paths like /services
    }
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "deecodek-labs-dev-secret-change-in-production",
    });
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "deecodek-labs-dev-secret-change-in-production",
  });
  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
