"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCardActive } from "./feature-card";
import { useCycle } from "./hooks";

const ROW_HEIGHT = 40;
const CYCLE_INTERVAL = 1700;
const DEFAULT_ACTION = 1;

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="whitespace-nowrap font-mono">{value}</span>
    </div>
  );
}

const ACTIONS: { label: string; source: string; result: ReactNode }[] = [
  {
    label: "Summary",
    source: "Pages 1–12",
    result: (
      <p className="text-xs leading-relaxed text-foreground/90">
        12-month supply agreement worth $48,750, payable in full by Oct 15,
        2027.
      </p>
    ),
  },
  {
    label: "Extract values",
    source: "Page 4, clause 3",
    result: (
      <div className="space-y-2.5">
        <ResultRow label="Total amount" value="$48,750.00" />
        <ResultRow label="Due date" value="Oct 15, 2027" />
        <ResultRow label="Late fee" value="2% per month" />
      </div>
    ),
  },
  {
    label: "Deadlines",
    source: "Pages 4–5",
    result: (
      <div className="space-y-2.5">
        <ResultRow label="Payment due" value="Oct 15, 2027" />
        <ResultRow label="Inspection" value="10 business days" />
      </div>
    ),
  },
  {
    label: "Compare",
    source: "2025 vs 2026 contract",
    result: (
      <div className="space-y-2.5">
        <ResultRow label="Total" value="$45,000 → $48,750" />
        <ResultRow label="Late fee" value="1.5% → 2%" />
      </div>
    ),
  },
];

export function ActionsPanel() {
  const active = useCardActive();
  const cycled = useCycle(
    active,
    ACTIONS.length,
    CYCLE_INTERVAL,
    DEFAULT_ACTION,
  );

  // Pointing at an action shows it right away and pauses the cycle
  const [pointed, setPointed] = useState<number | null>(null);
  const current = pointed ?? cycled;
  const { result, source } = ACTIONS[current];

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div
        onPointerLeave={() => setPointed(null)}
        className="relative shrink-0 rounded-xl bg-background p-1.5 ring-1 ring-border sm:w-44"
      >
        <motion.div
          initial={false}
          animate={{ y: current * ROW_HEIGHT }}
          transition={{ type: "spring", stiffness: 520, damping: 38 }}
          style={{ height: ROW_HEIGHT }}
          className="absolute inset-x-1.5 top-1.5 rounded-lg bg-primary/15"
        />

        {ACTIONS.map(({ label }, index) => (
          <div
            key={label}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setPointed(index);
            }}
            style={{ height: ROW_HEIGHT }}
            className={`relative flex items-center px-3 text-xs transition-colors duration-150 ${
              index === current
                ? "font-medium text-primary"
                : "text-muted-foreground"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="relative flex min-h-44 min-w-0 flex-1 flex-col rounded-xl bg-background p-4 ring-1 ring-border">
        <div className="relative flex-1">
          <AnimatePresence initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-x-0 top-0"
            >
              {result}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="flex items-center gap-1.5 border-t border-border pt-3 font-mono text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          {source}
        </p>
      </div>
    </div>
  );
}
