"use client";

import { useRef, useEffect, ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Left sticky visual + right scrubbed text (or reverse).
 * With prefers-reduced-motion: static stacked layout, no pin.
 */
export function PinnedSplit({
  visual,
  narrative,
  reverse = false,
  className,
  pinHeight = "140vh",
}: {
  visual: ReactNode;
  narrative: ReactNode;
  reverse?: boolean;
  className?: string;
  pinHeight?: string;
}) {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !stageRef.current || !textRef.current) return;

    const ctx = gsap.context(() => {
      const lines = textRef.current!.querySelectorAll("[data-scrub-line]");
      if (lines.length === 0) return;

      gsap.set(lines, { opacity: 0.28, y: 12 });

      ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: visualRef.current,
        pinSpacing: false,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const n = lines.length;
          lines.forEach((line, i) => {
            const start = i / n;
            const end = (i + 1) / n;
            const local = gsap.utils.clamp(0, 1, (progress - start) / (end - start || 1));
            gsap.set(line, {
              opacity: 0.28 + local * 0.72,
              y: 12 * (1 - local),
            });
          });
        },
      });
    }, stageRef);

    return () => ctx.revert();
  }, [reduce, reverse]);

  if (reduce) {
    return (
      <div className={cn("story-pin-stage", className)}>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
          <div className={cn(reverse && "lg:order-2")}>{visual}</div>
          <div className={cn(reverse && "lg:order-1")}>{narrative}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      className={cn("story-pin-stage relative", className)}
      style={{ minHeight: pinHeight }}
    >
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <div
            ref={visualRef}
            className={cn("relative", reverse && "lg:order-2")}
          >
            {visual}
          </div>
          <div
            ref={textRef}
            className={cn("relative flex flex-col justify-center", reverse && "lg:order-1")}
          >
            {narrative}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScrubLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-scrub-line className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
