"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useCardActive } from "./feature-card";

const EASE = [0.22, 1, 0.36, 1] as const;

const LINES = [
  { label: "Subtotal", value: "$11,200.00" },
  { label: "Tax", value: "$1,280.00" },
];

export function AccuracyPanel() {
  const active = useCardActive();

  return (
    <div className="relative flex h-44 flex-col items-center">
      <div className="w-full rounded-xl bg-background p-4 ring-1 ring-border">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>INVOICE #2048</span>
          <span>PAGE 3</span>
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: active ? 0.4 : 1 }}
          transition={{ duration: 0.2 }}
          className="mt-3 space-y-1.5"
        >
          {LINES.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between text-[11px] text-muted-foreground"
            >
              <span>{label}</span>
              <span className="font-mono">{value}</span>
            </div>
          ))}
        </motion.div>

        <div className="relative -mx-1.5 mt-1.5 flex items-center justify-between px-1.5 py-1 text-[11px] font-medium">
          <motion.span
            initial={false}
            animate={{ scaleX: active ? 1 : 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="absolute inset-0 origin-left rounded bg-primary/15"
          />
          <span className="relative">Total due</span>
          <span className="relative font-mono">$12,480.00</span>
        </div>
      </div>

      <svg width="2" height="20" className="shrink-0" aria-hidden="true">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="20"
          className="stroke-border"
          strokeWidth="1"
        />
        <motion.line
          x1="1"
          y1="0"
          x2="1"
          y2="20"
          initial={false}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ duration: 0.2, delay: active ? 0.16 : 0 }}
          className="stroke-primary"
          strokeWidth="2"
        />
      </svg>

      <div className="relative flex items-center gap-2 rounded-full bg-background py-1.5 pl-1.5 pr-3 ring-1 ring-border">
        <motion.span
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.2, delay: active ? 0.3 : 0 }}
          className="absolute inset-0 rounded-full ring-1 ring-primary/60"
        />

        <span className="relative flex size-4 items-center justify-center rounded-full bg-muted">
          <motion.span
            initial={false}
            animate={{ scale: active ? 1 : 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 22,
              delay: active ? 0.3 : 0,
            }}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Check className="size-2.5" strokeWidth={3} />
          </motion.span>
        </span>

        <span className="relative text-[11px] text-muted-foreground">
          Traced to page 3
        </span>
      </div>
    </div>
  );
}
