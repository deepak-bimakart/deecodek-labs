"use client";

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
