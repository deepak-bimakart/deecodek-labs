"use client";

import { useRef, useEffect, ReactNode, useState } from "react";
import { motion, useScroll, useVelocity, useReducedMotion } from "framer-motion";

// Velocity-based infinite marquee — continuously scrolls, speeds up
// and reverses direction based on scroll velocity.
// Uses a duplicated content track for seamless looping.
export function VelocityMarquee({
  children,
  baseVelocity = 2,
  className,
  reverse = false,
}: {
  children: ReactNode;
  baseVelocity?: number;
  className?: string;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [scrollDir, setScrollDir] = useState(reverse ? -1 : 1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const { scrollY } = useScroll();
  const velocityFactor = useVelocity(scrollY);

  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      const track = containerRef.current?.querySelector("[data-marquee-track]");
      if (track) {
        // Width of one copy (half the total since we duplicate)
        setTrackWidth((track as HTMLElement).scrollWidth / 2);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    // Re-measure after fonts/images load
    const timer = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timer);
    };
  }, []);

  // Update direction + speed based on scroll velocity
  useEffect(() => {
    if (reduce) return;
    let raf: number;
    const update = () => {
      const vel = velocityFactor.get();
      if (Math.abs(vel) > 0.5) {
        setScrollDir(vel < 0 ? -1 : 1);
        setSpeedMultiplier(1 + Math.min(Math.abs(vel) * 0.1, 5));
      } else {
        setSpeedMultiplier(1);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [velocityFactor, reduce]);

  if (reduce) {
    return (
      <div className={className}>
        <div className="flex gap-8 whitespace-nowrap">{children}</div>
      </div>
    );
  }

  // CSS animation approach — reliable, GPU-accelerated
  const animationDuration = 30 / (baseVelocity * speedMultiplier);
  const direction = scrollDir < 0 ? "reverse" : "normal";

  return (
    <div className={className} ref={containerRef} style={{ overflow: "hidden" }}>
      <div
        data-marquee-track
        className="flex"
        style={{
          width: "max-content",
          animation: `marquee-scroll ${animationDuration}s linear infinite ${direction}`,
        }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>{children}</div>
      </div>
      <style jsx>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
