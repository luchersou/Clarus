"use client";

import { motion } from "motion/react";
import { Check, Lock, LockOpen } from "lucide-react";
import { useCardActive } from "./feature-card";
import { useScramble, useSteps } from "./hooks";

const GUARANTEE_INTERVAL = 180;

const CONTRACT_TERMS = [
  { label: "Total amount", value: "$48,750.00" },
  { label: "Due date", value: "Oct 15, 2027" },
  { label: "Late fee", value: "2% per month" },
  { label: "Supplier", value: "Acme Supply Co." },
  { label: "Term", value: "12 months" },
  { label: "Inspection", value: "10 business days" },
];

const GUARANTEES = [
  {
    title: "Encrypted storage",
    detail: "Files are encrypted with AES-256.",
  },
  {
    title: "Isolated workspaces",
    detail: "Access is restricted to your account.",
  },
  {
    title: "No training on your data",
    detail: "Never used to train shared models.",
  },
];

function CipherLine({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  const cipherLabel = useScramble(label, active);
  const cipherValue = useScramble(value, active);

  return (
    <p className="flex justify-between gap-4 whitespace-pre">
      <span>{cipherLabel}</span>
      <span className="text-foreground/80">{cipherValue}</span>
    </p>
  );
}

function Guarantee({
  title,
  detail,
  done,
}: {
  title: string;
  detail: string;
  done: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-background p-4 ring-1 ring-border">
      <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
        <motion.span
          initial={false}
          animate={{ scale: done ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 24 }}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="size-2.5" strokeWidth={3} />
        </motion.span>
      </span>

      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export function SecurityPanel() {
  const active = useCardActive();
  const step = useSteps(active, GUARANTEES.length, GUARANTEE_INTERVAL);

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-border">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-border px-4">
          <span className="truncate text-xs font-medium">
            Supplier_Contract_2026.pdf
          </span>

          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] transition-colors duration-200 ${
              active
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {active ? (
              <Lock className="size-3" />
            ) : (
              <LockOpen className="size-3" />
            )}
            {active ? "AES-256" : "Readable"}
          </span>
        </div>

        <div className="space-y-2 overflow-hidden p-4 font-mono text-xs text-muted-foreground">
          {CONTRACT_TERMS.map(({ label, value }) => (
            <CipherLine
              key={label}
              label={label}
              value={value}
              active={active}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        {GUARANTEES.map(({ title, detail }, index) => (
          <Guarantee
            key={title}
            title={title}
            detail={detail}
            done={step > index}
          />
        ))}
      </div>
    </div>
  );
}
