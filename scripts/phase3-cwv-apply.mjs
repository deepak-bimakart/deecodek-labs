import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();

for (const d of [
  "public/images/optimized/hero",
  "public/images/optimized/products",
  "public/images/optimized/brand",
]) {
  fs.mkdirSync(path.join(root, d), { recursive: true });
}

async function writeVariants(input, outBase, { width, quality = 80 } = {}) {
  const make = () => sharp(input).rotate().resize({ width, withoutEnlargement: true });
  const isLogo = input.includes("logo");
  await make().webp({ quality, effort: 6 }).toFile(outBase + ".webp");
  await make().avif({ quality: Math.max(quality - 10, 45), effort: 6 }).toFile(outBase + ".avif");
  if (isLogo) await make().png({ compressionLevel: 9 }).toFile(outBase + ".png");
  else await make().jpeg({ quality, mozjpeg: true }).toFile(outBase + ".jpg");
  console.log("wrote", outBase);
}

await writeVariants(
  "public/images/hero/ambient-bg.png",
  "public/images/optimized/hero/ambient-bg",
  { width: 1600, quality: 72 }
);
await writeVariants(
  "public/images/hero/architecture.png",
  "public/images/optimized/hero/architecture",
  { width: 1024, quality: 78 }
);
await writeVariants(
  "public/images/products/marketflow-dashboard.png",
  "public/images/optimized/products/marketflow-dashboard",
  { width: 1344, quality: 78 }
);
await writeVariants(
  "public/images/products/sadika-app.png",
  "public/images/optimized/products/sadika-app",
  { width: 768, quality: 78 }
);
await writeVariants("public/logo-light.png", "public/images/optimized/brand/logo-light", {
  width: 240,
  quality: 90,
});
await writeVariants("public/logo-dark.png", "public/images/optimized/brand/logo-dark", {
  width: 240,
  quality: 90,
});

const files = {
  "next.config.ts": `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No \`output: "standalone"\` — Vercel uses its own Next.js build output.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

export default nextConfig;
`,
  "src/components/logo.tsx": `import Image from "next/image";

// DeeCodeK Labs logo — uses the real brand logo image.
// Renders both light and dark variants, toggles visibility via CSS
// based on the .dark class on <html>. This is more reliable than
// useTheme() which can have hydration timing issues with next/image.
// No priority: header logo is not the LCP element on the homepage.
export function Logo({ className }: { className?: string }) {
  return (
    <div className={\`relative inline-flex \${className ?? ""}\`} style={{ minHeight: "1em" }}>
      <Image
        src="/images/optimized/brand/logo-light.png"
        alt="DeeCodeK Labs"
        width={120}
        height={93}
        sizes="120px"
        className="h-auto w-auto dark:hidden"
      />
      <Image
        src="/images/optimized/brand/logo-dark.png"
        alt="DeeCodeK Labs"
        width={120}
        height={93}
        sizes="120px"
        className="hidden h-auto w-auto dark:block"
      />
    </div>
  );
}
`,
  "src/components/motion/smooth-scroll.tsx": `"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

type LenisLike = {
  destroy: () => void;
  scrollTo: (target: unknown, opts?: unknown) => void;
  on: (e: string, cb: unknown) => void;
  raf: (t: number) => void;
};

let lenisInstance: LenisLike | null = null;

export function getLenis() {
  return lenisInstance;
}

/** Lenis only on the main homepage — keeps inner pages snappy.
 *  GSAP + Lenis load after paint so they never block LCP. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const enable = pathname === "/";

  useEffect(() => {
    if (!enable) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let cancelled = false;
    let ticker: ((time: number) => void) | null = null;
    let gsapRef: typeof import("gsap").default | null = null;
    let ScrollTriggerRef: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

    const start = async () => {
      await new Promise<void>((resolve) => {
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(() => resolve(), { timeout: 1200 });
        } else {
          setTimeout(resolve, 200);
        }
      });
      if (cancelled) return;

      const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;
      ScrollTriggerRef = ScrollTrigger;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        infinite: false,
      });

      lenisInstance = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      ticker = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      (window as unknown as { lenisScrollTo?: (target: string | number, opts?: unknown) => void }).lenisScrollTo =
        (target: string | number, opts?: unknown) => {
          if (typeof target === "string") {
            const el = document.querySelector(target);
            if (el) lenis.scrollTo(el as HTMLElement, opts);
          } else {
            lenis.scrollTo(target, opts);
          }
        };
    };

    start();

    return () => {
      cancelled = true;
      if (ticker && gsapRef) gsapRef.ticker.remove(ticker);
      lenisInstance?.destroy();
      lenisInstance = null;
      (window as unknown as { lenisScrollTo?: unknown }).lenisScrollTo = undefined;
      ScrollTriggerRef?.refresh();
    };
  }, [enable]);

  return <>{children}</>;
}
`,
  "src/components/visuals/hero-visual.tsx": `"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Editorial terminal panel — teal brand, no fake SaaS metrics.
 *  Light entrance only — avoid long stagger that delays perceived readiness. */
export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative h-full w-full"
      initial={reduce ? false : { opacity: 0.9, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-4 h-48 w-48 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative z-20 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-primary/5">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
          <div className="ml-3 flex-1 truncate rounded-md bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            visitor@deecodek — studio
          </div>
        </div>

        <div className="space-y-1.5 bg-[#0a1210] px-5 py-5 font-mono text-[12px] leading-relaxed dark:bg-[#05090d]">
          <p className="text-primary/50"># DeeCodeK Labs — studio toolchain</p>
          <p>
            <span className="text-primary">$ </span>
            <span className="text-[#e8f5eb]">deecodek status --studio</span>
          </p>
          <p className="h-2" />
          <p>
            <span className="text-primary">services</span>
            <span className="text-[#8fa896]">  custom products · backends · apps</span>
          </p>
          <p>
            <span className="text-primary">lab</span>
            <span className="text-[#8fa896]">       opensource.deecodeklabs.com</span>
          </p>
          <p>
            <span className="text-primary">stack</span>
            <span className="text-[#8fa896]">     Next.js · Prisma · Flutter · Go</span>
          </p>
          <p className="h-2" />
          <p className="text-primary">✓ building useful things in the open</p>
          <div className="flex items-center gap-1 pt-2">
            <span className="text-primary">$</span>
            <span className="inline-block h-3.5 w-[7px] animate-pulse bg-primary" />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 -left-3 z-30 hidden rounded-lg border border-border bg-card px-3 py-2 shadow-md sm:block">
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Shipping
        </p>
        <p className="text-xs font-medium text-foreground">Studio + Product Lab</p>
      </div>
    </motion.div>
  );
}
`,
};

for (const [rel, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, rel), body, "utf8");
  console.log("wrote", rel);
}

console.log("phase3 apply script core files done");
