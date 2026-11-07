"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useCardActive } from "./feature-card";

const SPRING = { type: "spring", stiffness: 420, damping: 26 } as const;

const FILES = [
  {
    format: "PDF",
    name: "contract",
    color: "#f87171",
    rest: { x: -30, y: 6, rotate: -7 },
    open: { x: -92, y: 8, rotate: -9 },
  },
  {
    format: "XLSX",
    name: "report",
    color: "#4ade80",
    rest: { x: 30, y: 6, rotate: 7 },
    open: { x: 92, y: 8, rotate: 9 },
  },
  {
    format: "DOCX",
    name: "invoice",
    color: "#60a5fa",
    rest: { x: 0, y: 0, rotate: 0 },
    open: { x: 0, y: -8, rotate: 0 },
  },
];

export function FormatsPanel() {
  const active = useCardActive();

  return (
    <div className="relative h-44">
      {FILES.map(({ format, name, color, rest, open }, index) => (
        <motion.div
          key={format}
          initial={false}
          animate={active ? open : rest}
          transition={{ ...SPRING, delay: active ? index * 0.03 : 0 }}
          className="absolute left-1/2 top-3 -ml-12 flex h-36 w-24 flex-col justify-between rounded-lg bg-background p-3 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.8)] ring-1 ring-border"
        >
          <div className="space-y-1.5">
            <div className="h-1 w-8 rounded-full bg-foreground/25" />
            <div className="h-1 w-full rounded-full bg-muted" />
            <div className="h-1 w-5/6 rounded-full bg-muted" />
            <div className="h-1 w-full rounded-full bg-muted" />
            <div className="h-1 w-2/3 rounded-full bg-muted" />
          </div>

          <div>
            <p className="truncate text-[10px] text-muted-foreground">{name}</p>

            <div className="mt-1 flex items-center justify-between">
              <span
                style={{ color }}
                className="font-mono text-[10px] font-semibold"
              >
                {format}
              </span>

              <motion.span
                initial={false}
                animate={{ scale: active ? 1 : 0 }}
                transition={{ ...SPRING, delay: active ? 0.1 + index * 0.06 : 0 }}
                className="flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Check className="size-2.5" strokeWidth={3} />
              </motion.span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
