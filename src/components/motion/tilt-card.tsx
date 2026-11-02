"use client";

import { useRef, ReactNode, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

// 3D perspective card tilt & glare — rotates along X/Y axes toward cursor
// with spring physics and a dynamic holographic reflection layer.
export function TiltCard({
  children,
  className,
  intensity = 12,
  glareOpacity = 0.15,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glareOpacity?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Mouse position normalized -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring-smoothed rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 200,
    damping: 20,
  });

  // Glare position
  const glareX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);
  const glareBg = useTransform(
    [glareX, glareY],
    ([gx, gy]: any) =>
      `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,${glareOpacity}), transparent 50%)`
  );

  function onMouseMove(e: React.MouseEvent) {
    if (!ref.current || reduce) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  }

  function onMouseEnter() {
    if (!reduce) setIsHovering(true);
  }

  function onMouseLeave() {
    if (!reduce) {
      setIsHovering(false);
      x.set(0);
      y.set(0);
    }
  }

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full"
      >
        {children}

        {/* Holographic glare overlay */}
        {isHovering && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
