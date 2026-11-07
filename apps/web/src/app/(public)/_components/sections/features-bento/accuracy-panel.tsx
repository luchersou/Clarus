"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useCardActive } from "./feature-card";
import { useCycle } from "./hooks";

const CYCLE_INTERVAL = 1500;
const ROW_HEIGHT = 44;
const LINK_WIDTH = 32;
const PANEL_HEIGHT = ROW_HEIGHT * 3;
const SOURCE_LINE_HEIGHT = 16;

const SPRING = { type: "spring", stiffness: 520, damping: 38 } as const;

// sourceY is where the value sits on the page thumbnail
const VALUES = [
  { label: "Subtotal", value: "$11,200.00", line: 12, sourceY: 62 },
  { label: "Tax", value: "$1,280.00", line: 13, sourceY: 82 },
  { label: "Total due", value: "$12,480.00", line: 14, sourceY: 102 },
];

const TEXT_LINES = ["w-full", "w-5/6", "w-2/3"];

function PagePreview({ current }: { current: number }) {
  return (
    <div
      style={{ height: PANEL_HEIGHT }}
      className="relative w-24 shrink-0 overflow-hidden rounded-lg bg-background p-2.5 ring-1 ring-border"
    >
      <p className="font-mono text-[10px] leading-none text-muted-foreground">
        Page 3
      </p>

      <div className="mt-2.5 space-y-1.5">
        {TEXT_LINES.map((width) => (
          <div key={width} className={`h-1 rounded-full bg-muted ${width}`} />
        ))}
      </div>

      <motion.div
        initial={false}
        animate={{ y: VALUES[current].sourceY }}
        transition={SPRING}
        style={{ height: SOURCE_LINE_HEIGHT }}
        className="absolute inset-x-1 top-0 rounded bg-primary/15 ring-1 ring-primary/50"
      />

      {VALUES.map(({ label, sourceY }, index) => (
        <div
          key={label}
          style={{ top: sourceY, height: SOURCE_LINE_HEIGHT }}
          className="absolute inset-x-2.5 flex items-center justify-between gap-2"
        >
          <span
            className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
              index === current ? "bg-foreground/50" : "bg-muted"
            }`}
          />
          <span
            className={`h-1 w-5 rounded-full transition-colors duration-150 ${
              index === current ? "bg-primary" : "bg-muted"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function SourceLinks({ current, lit }: { current: number; lit: boolean }) {
  return (
    <svg
      width={LINK_WIDTH}
      height={PANEL_HEIGHT}
      className="shrink-0"
      aria-hidden="true"
    >
      {VALUES.map(({ label, sourceY }, index) => {
        const fromY = sourceY + SOURCE_LINE_HEIGHT / 2;
        const toY = ROW_HEIGHT * index + ROW_HEIGHT / 2;
        const middleX = LINK_WIDTH / 2;
        const selected = index === current;

        return (
          <motion.path
            key={label}
            d={`M 0 ${fromY} C ${middleX} ${fromY}, ${middleX} ${toY}, ${LINK_WIDTH} ${toY}`}
            initial={false}
            animate={{
              pathLength: selected ? 1 : 0,
              opacity: selected ? (lit ? 1 : 0.4) : 0,
            }}
            transition={{ duration: selected ? 0.24 : 0.1, ease: "easeOut" }}
            className="fill-none stroke-primary"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

export function AccuracyPanel() {
  const active = useCardActive();
  const cycled = useCycle(
    active,
    VALUES.length,
    CYCLE_INTERVAL,
    VALUES.length - 1,
  );

  // Pointing at a value traces it right away and pauses the cycle
  const [pointed, setPointed] = useState<number | null>(null);
  const current = pointed ?? cycled;
  const lit = active || pointed !== null;

  return (
    <div className="flex h-44 flex-col justify-between">
      <div className="flex">
        <PagePreview current={current} />

        <SourceLinks current={current} lit={lit} />

        <div
          onPointerLeave={() => setPointed(null)}
          className="relative min-w-0 flex-1 overflow-hidden rounded-lg bg-background ring-1 ring-border"
        >
          <motion.div
            initial={false}
            animate={{ y: current * ROW_HEIGHT }}
            transition={SPRING}
            style={{ height: ROW_HEIGHT }}
            className="absolute inset-x-0 top-0 bg-primary/15"
          />

          {VALUES.map(({ label, value }, index) => (
            <div
              key={label}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPointed(index);
              }}
              style={{ height: ROW_HEIGHT }}
              className="relative flex flex-col justify-center px-3"
            >
              <span className="text-[10px] leading-tight text-muted-foreground">
                {label}
              </span>

              <span
                className={`font-mono text-xs leading-tight transition-colors duration-150 ${
                  index === current ? "font-medium text-primary" : ""
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex h-8 items-center gap-2 overflow-hidden rounded-full bg-background pl-2 pr-3 ring-1 ring-border">
        <span
          className={`flex size-4 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${
            lit
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Check className="size-2.5" strokeWidth={3} />
        </span>

        <div className="relative h-4 min-w-0 flex-1">
          <AnimatePresence initial={false}>
            <motion.span
              key={current}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute inset-0 truncate text-[11px] leading-4 text-muted-foreground"
            >
              Traced to page 3, line {VALUES[current].line}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
