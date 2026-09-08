export function AccuracyPanel() {
  return (
    <>
      <style>{`
        @keyframes accuracy-doc {
          0%, 15% { translate: -50% -50%; }
          40%, 100% { translate: -50% -58%; }
        }
        @keyframes accuracy-scan {
          0%, 15% { top: 8%; opacity: 0; }
          20% { opacity: 1; }
          38% { top: 88%; opacity: 1; }
          42%, 100% { top: 88%; opacity: 0; }
        }
        @keyframes accuracy-total-row {
          0%, 35% { border-color: var(--border); background-color: transparent; }
          45%, 100% { border-color: color-mix(in oklch, var(--primary) 50%, transparent); background-color: color-mix(in oklch, var(--primary) 10%, transparent); }
        }
        @keyframes accuracy-marker {
          0%, 40% { scale: 1; }
          48% { scale: 1.5; }
          56%, 100% { scale: 1; }
        }
        @keyframes accuracy-connector {
          0%, 45% { scale: 1 0.5; opacity: 0.4; }
          60%, 100% { scale: 1 1; opacity: 1; }
        }
        @keyframes accuracy-badge {
          0%, 50% { translate: -50% 0; scale: 0.95; opacity: 0.7; }
          65%, 88% { translate: -50% 0; scale: 1; opacity: 1; }
          97%, 100% { translate: -50% 0; scale: 0.95; opacity: 0.7; }
        }
      `}</style>

      <div className="group relative h-36 w-full">
        {/* Document */}
        <div className="absolute left-1/2 top-1/2 w-[min(100%,220px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-background p-3 shadow-sm group-hover:[animation:accuracy-doc_4s_ease-in-out_infinite]">
          {/* Scan line */}
          <div className="pointer-events-none absolute inset-x-0 h-px bg-primary opacity-0 shadow-[0_0_6px_1px] shadow-primary/60 group-hover:[animation:accuracy-scan_4s_ease-in-out_infinite]" />

          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[7px] font-medium text-muted-foreground">
              INVOICE #2048
            </span>
            <span className="font-mono text-[7px] text-muted-foreground">SEP 2026</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[7px] text-muted-foreground">Subtotal</span>
              <span className="font-mono text-[7px] text-muted-foreground">$11,200.00</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[7px] text-muted-foreground">Tax</span>
              <span className="font-mono text-[7px] text-muted-foreground">$1,280.00</span>
            </div>

            <div className="mt-2 flex items-center justify-between rounded-md border border-border bg-transparent px-2 py-1.5 group-hover:[animation:accuracy-total-row_4s_ease-in-out_infinite]">
              <span className="text-[7px] font-medium">Total Due</span>
              <span className="font-mono text-[7px] font-semibold">$12,480.00</span>
            </div>
          </div>

          {/* Source marker */}
          <div className="absolute bottom-2 -right-1 size-2 rounded-full border border-primary/40 bg-background group-hover:[animation:accuracy-marker_4s_ease-in-out_infinite]" />
        </div>

        {/* Connection */}
        <div className="absolute bottom-6 left-1/2 h-5 w-px origin-top bg-primary/30 group-hover:[animation:accuracy-connector_4s_ease-in-out_infinite]" />

        {/* Verification */}
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 group-hover:[animation:accuracy-badge_4s_ease-in-out_infinite]">
          <span className="flex size-3.5 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 text-[7px] text-green-500">
            ✓
          </span>
          <span className="text-[7px] text-muted-foreground">Source verified</span>
        </div>
      </div>
    </>
  );
}