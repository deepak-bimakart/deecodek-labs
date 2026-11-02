"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Server, Globe, Smartphone, Bot, Boxes, Plug } from "lucide-react";

// Each mini-visual is shown only when card is hovered, with a subtle entrance.
// All visuals are pure HTML/CSS — no external images.

// ── Backend: connected-node visualization ──────────────────────────────
export function BackendVisual() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 120 60" className="h-12 w-full">
      {/* Lines */}
      <motion.line
        x1="20" y1="20" x2="60" y2="30"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="1"
        strokeDasharray="60"
        initial={reduce ? false : { strokeDashoffset: 60 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.6 }}
      />
      <motion.line
        x1="20" y1="40" x2="60" y2="30"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="1"
        strokeDasharray="60"
        initial={reduce ? false : { strokeDashoffset: 60 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <motion.line
        x1="60" y1="30" x2="100" y2="20"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="1"
        strokeDasharray="60"
        initial={reduce ? false : { strokeDashoffset: 60 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
      <motion.line
        x1="60" y1="30" x2="100" y2="40"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="1"
        strokeDasharray="60"
        initial={reduce ? false : { strokeDashoffset: 60 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      {/* Nodes */}
      {[[20, 20], [20, 40], [60, 30], [100, 20], [100, 40]].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="4"
          className="fill-primary"
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
        />
      ))}
    </svg>
  );
}

// ── Full-Stack: miniature browser interface ────────────────────────────
export function FullStackVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="h-12 w-full overflow-hidden rounded border border-border bg-card">
      <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-1.5 py-1">
        <span className="h-1 w-1 rounded-full bg-red-400/60" />
        <span className="h-1 w-1 rounded-full bg-amber-400/60" />
        <span className="h-1 w-1 rounded-full bg-emerald-400/60" />
        <div className="ml-2 h-1.5 flex-1 rounded-sm bg-background/60" />
      </div>
      <div className="flex gap-1 p-1.5">
        <motion.div
          className="w-1/4 space-y-1"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="h-1 w-full rounded-sm bg-primary/60" />
          <div className="h-1 w-3/4 rounded-sm bg-muted" />
          <div className="h-1 w-2/3 rounded-sm bg-muted" />
        </motion.div>
        <div className="flex-1 space-y-1">
          <motion.div
            className="h-1.5 w-full rounded-sm bg-primary/40"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ originX: 0 }}
          />
          <div className="h-1 w-full rounded-sm bg-muted" />
          <div className="h-1 w-5/6 rounded-sm bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ── Flutter: mobile device mockup ──────────────────────────────────────
export function FlutterVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-12 w-full items-center justify-center">
      <motion.div
        className="relative h-10 w-6 rounded-md border border-border bg-card shadow-sm"
        initial={reduce ? false : { y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute left-1/2 top-1 h-0.5 w-2 -translate-x-1/2 rounded-full bg-muted-foreground/40" />
        <div className="space-y-0.5 p-1 pt-2">
          <div className="h-1 w-full rounded-sm bg-primary/60" />
          <div className="h-1 w-3/4 rounded-sm bg-muted" />
          <div className="h-1 w-5/6 rounded-sm bg-muted" />
          <div className="mt-1 h-2 w-full rounded-sm bg-primary/20" />
          <div className="h-1 w-full rounded-sm bg-muted" />
          <div className="h-1 w-2/3 rounded-sm bg-muted" />
        </div>
      </motion.div>
    </div>
  );
}

// ── AI Agents: connected AI nodes with pulse ───────────────────────────
export function AIAgentVisual() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 120 50" className="h-12 w-full">
      {/* Center node */}
      <motion.circle
        cx="60"
        cy="25"
        r="6"
        className="fill-primary"
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.circle
        cx="60"
        cy="25"
        r="6"
        className="fill-primary"
        animate={reduce ? {} : { scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      {/* Surrounding nodes */}
      {[[20, 15], [20, 35], [100, 15], [100, 35]].map(([cx, cy], i) => (
        <g key={i}>
          <motion.line
            x1="60" y1="25" x2={cx} y2={cy}
            stroke="currentColor"
            className="text-primary/40"
            strokeWidth="1"
            strokeDasharray="60"
            initial={reduce ? false : { strokeDashoffset: 60 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r="3"
            className="fill-primary/60"
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          />
        </g>
      ))}
    </svg>
  );
}

// ── SaaS: miniature dashboard preview ──────────────────────────────────
export function SaaSVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-12 w-full items-end gap-1 rounded border border-border bg-card p-1.5">
      {[40, 60, 45, 75, 55, 85, 70, 90].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-primary/50"
          initial={reduce ? false : { height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
        />
      ))}
    </div>
  );
}

// ── API: animated connection illustration ──────────────────────────────
export function APIVisual() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 120 50" className="h-12 w-full">
      {/* Left box */}
      <motion.rect
        x="8" y="18" width="20" height="14" rx="2"
        className="fill-primary/20 stroke-primary"
        strokeWidth="1"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      {/* Right box */}
      <motion.rect
        x="92" y="18" width="20" height="14" rx="2"
        className="fill-primary/20 stroke-primary"
        strokeWidth="1"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      {/* Connection line with animated dash */}
      <line
        x1="28" y1="25" x2="92" y2="25"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="1"
        strokeDasharray="4 4"
      >
        {!reduce && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-16"
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
      </line>
      {/* Endpoint dots */}
      <motion.circle cx="28" cy="25" r="2" className="fill-primary"
        initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} />
      <motion.circle cx="92" cy="25" r="2" className="fill-primary"
        initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
      <text x="60" y="14" textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="6">
        REST
      </text>
    </svg>
  );
}

export const CAPABILITY_VISUALS: Record<string, () => JSX.Element> = {
  Server: BackendVisual,
  Globe: FullStackVisual,
  Smartphone: FlutterVisual,
  Bot: AIAgentVisual,
  Boxes: SaaSVisual,
  Plug: APIVisual,
};
