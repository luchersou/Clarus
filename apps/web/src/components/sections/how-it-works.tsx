"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { Check, FileText } from "lucide-react";

const ACTIONS = [
  { label: "Summary", active: false },
  { label: "Extract values", active: true },
  { label: "Deadlines", active: false },
  { label: "Compare", active: false },
];

const RESULT = [
  { field: "Total amount", value: "$4,820.00" },
  { field: "Due date", value: "Oct 15, 2026" },
];

function UploadVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Supplier_Contract.pdf</p>
          <p className="text-xs text-muted-foreground">2.4 MB · PDF</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-full rounded-full bg-primary" />
      </div>
      <p className="mt-1.5 text-right font-mono text-[10px] text-muted-foreground">
        Uploaded
      </p>
    </div>
  );
}

function ActionVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-2">
      <div className="flex flex-col gap-1">
        {ACTIONS.map(({ label, active }) => (
          <div
            key={label}
            className={
              active
                ? "flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                : "flex items-center justify-between rounded-lg px-3 py-2 text-xs text-muted-foreground"
            }
          >
            {label}
            {active && <Check className="size-3.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="space-y-2">
        {RESULT.map(({ field, value }) => (
          <div key={field} className="flex items-center justify-between gap-6">
            <span className="text-xs text-muted-foreground">{field}</span>
            <span className="font-mono text-xs font-medium">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2">
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="font-mono text-[10px] text-muted-foreground">
          Source: page 3 · 98% confidence
        </span>
      </div>
    </div>
  );
}

type StepData = {
  number: string;
  title: string;
  description: string;
  visual: React.ReactNode;
};

const STEPS: StepData[] = [
  {
    number: "01",
    title: "Upload your document",
    description:
      "Drop a contract, invoice, or financial report. Clarus reads it in seconds.",
    visual: <UploadVisual />,
  },
  {
    number: "02",
    title: "Choose an action",
    description:
      "Summarize, extract values, check deadlines, or compare against another document.",
    visual: <ActionVisual />,
  },
  {
    number: "03",
    title: "Get a precise answer",
    description:
      "Structured, accurate results — no digging through pages to find what matters.",
    visual: <ResultVisual />,
  },
];

function Step({ step, reversed }: { step: StepData; reversed: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 45%"],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const [isActive, setIsActive] = useState(false);
  useMotionValueEvent(progress, "change", (v) => setIsActive(v >= 0.98));

  const dotClass = `size-2 rounded-full transition-all duration-300 ${
    isActive ? "scale-125 bg-primary" : "bg-border"
  }`;

  const textBlock = (
    <div className={reversed ? "" : "md:text-right"}>
      <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
      <h3 className="mt-1 text-xl font-medium">{step.title}</h3>
      <p className={`mt-2 max-w-sm text-muted-foreground ${reversed ? "" : "md:ml-auto"}`}>
        {step.description}
      </p>
    </div>
  );

  const visualBlock = (
    <div className={reversed ? "md:mr-auto" : "md:ml-auto"}>
      <div className="max-w-[220px]">{step.visual}</div>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {/* Mobile: single column */}
      <div className="pl-10 md:hidden">
        <span className={`absolute left-0 top-1.5 ${dotClass}`} />
        <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
        <h3 className="mt-1 text-xl font-medium">{step.title}</h3>
        <p className="mt-2 text-muted-foreground">{step.description}</p>
        <div className="mt-4 max-w-[220px]">{step.visual}</div>
      </div>

      {/* Desktop: fixed columns, only the content alternates */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8">
        <div className="order-1">{reversed ? visualBlock : textBlock}</div>
        <span className={`order-2 ${dotClass}`} />
        <div className="order-3">{reversed ? textBlock : visualBlock}</div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-24 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          How it works
        </h2>

        <div ref={containerRef} className="relative">
          <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            className="absolute left-[3px] top-2 w-px bg-primary md:left-1/2 md:-translate-x-1/2"
            style={{ height: lineHeight }}
          />

          <div className="flex flex-col gap-16 md:gap-24">
            {STEPS.map((step, index) => (
              <Step key={step.number} step={step} reversed={index % 2 === 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}