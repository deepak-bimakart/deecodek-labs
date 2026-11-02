"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

type TrailImage = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

// Cursor image trail — moving the mouse rapidly spawns floating images.
// Light mode: cat image. Dark mode: dog image.
export function CursorTrail() {
  const reduce = useReducedMotion();
  const { theme, resolvedTheme } = useTheme();
  const [trail, setTrail] = useState<TrailImage[]>([]);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);

  // Determine which image to use based on theme
  // resolvedTheme handles "system" preference
  const currentTheme = resolvedTheme ?? theme;
  const imageSrc = currentTheme === "dark"
    ? "/images/cursor-dog.png"
    : "/images/cursor-cat.png";

  useEffect(() => {
    if (reduce) return;

    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt = now - lastTime;
      const velocity = dist / Math.max(dt, 1);

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;

      // Spawn when moving fast enough, throttle to every 100ms
      if (velocity > 1.2 && now - lastSpawnRef.current > 100) {
        lastSpawnRef.current = now;
        const id = idRef.current++;
        const rotation = (Math.random() - 0.5) * 40;
        const scale = 0.6 + Math.random() * 0.4;

        setTrail((prev) => [
          ...prev.slice(-5),
          { id, x: e.clientX, y: e.clientY, rotation, scale },
        ]);

        // Remove after 1.2s
        setTimeout(() => {
          setTrail((prev) => prev.filter((t) => t.id !== id));
        }, 1200);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, imageSrc]);

  if (reduce) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {trail.map((item) => (
        <div
          key={item.id}
          className="absolute"
          style={{
            left: item.x - 40,
            top: item.y - 40,
            width: 80,
            height: 80,
            transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
            opacity: 0,
            animation: "cursor-trail-pop 1.2s ease-out forwards",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full rounded-full object-cover border-2 border-primary/30 shadow-2xl"
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes cursor-trail-pop {
          0% { opacity: 0; transform: scale(0.3); }
          15% { opacity: 0.95; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
