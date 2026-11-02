"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useInView } from "framer-motion";

// Scramble / cipher text decode — characters cycle through random glyphs
// then lock into the final text, like a hacker terminal.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/";

export function ScrambleText({
  text,
  className,
  duration = 1.2,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: any;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(reduce ? text : "");

  useEffect(() => {
    if (reduce || !inView) return;

    let raf: number;
    let start: number | null = null;
    const targetChars = text.split("");

    const animate = (t: number) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000 - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * targetChars.length);

      const scrambled = targetChars
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedCount) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplay(scrambled);

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, text, duration, delay, reduce]);

  return (
    <Tag ref={ref as any} className={className}>
      {display}
    </Tag>
  );
}
