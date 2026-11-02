"use client";

import { useRef, ReactNode, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Sticky stacking cards (deck effect) — cards slide up and stack on top
// of each other as you scroll, with previous cards scaling down and dimming.
export function StackingCards({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".stacking-card");

      cards.forEach((card, i) => {
        // Initial state
        gsap.set(card, {
          y: i === 0 ? 0 : window.innerHeight * 0.5,
          scale: 1,
          opacity: 1,
          zIndex: i,
        });

        if (i === 0) return;

        gsap.to(card, {
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        });
      });

      // Scale down + dim previous cards as new ones come up
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.5,
          filter: "brightness(0.8)",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reduce, children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export function StackingCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`stacking-card sticky top-0 ${className ?? ""}`}>
      {children}
    </div>
  );
}
