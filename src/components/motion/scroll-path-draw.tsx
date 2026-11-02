"use client";

import { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// SVG path drawing on scroll — a decorative line traces itself down
// the page in sync with scroll position.
export function ScrollPathDraw({
  path,
  className,
  strokeWidth = 2,
  duration,
}: {
  path: string; // SVG path d attribute
  className?: string;
  strokeWidth?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (reduce || !pathRef.current) return;

    const ctx = gsap.context(() => {
      const len = pathRef.current!.getTotalLength();
      gsap.set(pathRef.current, {
        strokeDasharray: len,
        strokeDashoffset: len,
      });

      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: pathRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 0.5,
        },
      });
    });

    return () => ctx.revert();
  }, [reduce]);

  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        ref={pathRef}
        d={path}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-primary"
      />
    </svg>
  );
}
