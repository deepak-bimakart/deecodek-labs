export function PreviewBadge() {
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-3 z-[100] -translate-x-1/2 rounded-md border border-amber-500/40 bg-amber-500/95 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-950 shadow-sm"
      role="status"
    >
      Preview — Draft
    </div>
  );
}
