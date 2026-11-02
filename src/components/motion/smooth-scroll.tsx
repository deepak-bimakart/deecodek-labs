"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

/** Lenis only on the main homepage — keeps inner pages snappy. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const enable = pathname === "/";

  useEffect(() => {
    if (!enable) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    (window as any).lenisScrollTo = (target: string | number, opts?: any) => {
      if (typeof target === "string") {
        const el = document.querySelector(target);
        if (el) lenis.scrollTo(el as HTMLElement, opts);
      } else {
        lenis.scrollTo(target, opts);
      }
    };

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisInstance = null;
      (window as any).lenisScrollTo = undefined;
      ScrollTrigger.refresh();
    };
  }, [enable]);

  return <>{children}</>;
}
