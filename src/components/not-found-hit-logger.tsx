"use client";

import { useEffect } from "react";

/** Logs 404 hits to the CMS monitor (fire-and-forget). */
export function NotFoundHitLogger() {
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    const referrer = document.referrer || null;
    void fetch("/api/public/not-found-hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
