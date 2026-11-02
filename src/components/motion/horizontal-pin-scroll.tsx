"use client";

import { useRef, ReactNode, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Pinned horizontal scroll — vertical scroll locks the viewport and glides
// the inner content sideways before resuming vertical scroll.
export function HorizontalPinScroll({
  children,
  className,
  pinClassName,
}: {
  children: ReactNode;
  className?: string;
  pinClassName?: string;
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !sectionRef.current || !trackRef.current) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const ctx = gsap.context(() => {
      // Calculate how far the track needs to move
      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth);
      };

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.abs(getScrollAmount())}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={sectionRef} className={className}>
      <div className={`overflow-hidden ${pinClassName ?? ""}`}>
        <div
          ref={trackRef}
          className="flex"
          style={{
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
