"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useCardActive } from "./feature-card";
import { useSteps } from "./hooks";

const STEP_INTERVAL = 620;
const NODE_SIZE = 32;

// The stages and events of the real document processing flow
const STAGES = [
  { label: "Upload", detail: "Stored", event: "document.uploaded" },
  { label: "Extract", detail: "Text and chunks", event: "extracting text" },
  { label: "Embed", detail: "Vectors indexed", event: "document.embedded" },
  { label: "Ready", detail: "Ask anything", event: "status: PROCESSED" },
];

function Node({ number, done }: { number: number; done: boolean }) {
  return (
    <div
      style={{ width: NODE_SIZE, height: NODE_SIZE }}
      className="relative flex items-center justify-center rounded-full bg-background ring-1 ring-border"
    >
      <span className="font-mono text-[10px] text-muted-foreground">
        {number}
      </span>

      <motion.span
        initial={false}
        animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 26 }}
        className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Check className="size-3.5" strokeWidth={3} />
      </motion.span>
    </div>
  );
}

export function PipelinePanel() {
  const active = useCardActive();
  const step = useSteps(active, STAGES.length, STEP_INTERVAL);

  const progress = step > 1 ? (step - 1) / (STAGES.length - 1) : 0;
  const position = `${((Math.max(step, 1) - 0.5) / STAGES.length) * 100}%`;

  return (
    <div className="relative h-44 overflow-hidden">
      {/* Current event, riding above its stage. Centered where it wouldn't fit */}
      <motion.div
        initial={false}
        animate={{ left: position }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={`absolute top-3 -translate-x-1/2 whitespace-nowrap max-sm:left-1/2! rounded-full px-2.5 py-1 font-mono text-[10px] transition-colors duration-200 ${
          step > 0
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {step > 0 ? STAGES[step - 1].event : "awaiting upload"}
      </motion.div>

      <div className="absolute inset-x-0 top-[3.75rem] grid grid-cols-4">
        {/* Track between the first and last node */}
        <span
          style={{ top: NODE_SIZE / 2 }}
          className="absolute inset-x-[12.5%] h-px bg-border"
        />
        <motion.span
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: active ? STEP_INTERVAL / 1000 : 0.25 }}
          style={{ top: NODE_SIZE / 2 - 1 }}
          className="absolute inset-x-[12.5%] h-0.5 origin-left bg-primary"
        />

        {STAGES.map(({ label, detail }, index) => (
          <div key={label} className="relative flex flex-col items-center">
            <Node number={index + 1} done={step > index} />

            <p className="mt-3 text-xs font-medium">{label}</p>

            <p className="mt-0.5 text-center text-[10px] leading-snug text-muted-foreground">
              {detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
