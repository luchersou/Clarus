"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Check, FileText } from "lucide-react";
import {
  ACTIONS,
  EXTRACTED_VALUES,
  FILE_NAME,
  PAGE_COUNT,
  SELECTED_ACTION,
  STEPS,
} from "./steps";

const EASE = [0.22, 1, 0.36, 1] as const;

const IN_VIEW = { once: true, amount: 0.6 };

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: EASE, delay },
});

function UploadVisual() {
  return (
    <div className="rounded-xl bg-background p-4 ring-1 ring-foreground/[0.08]">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{FILE_NAME}</p>
          <p className="text-xs text-muted-foreground">
            {PAGE_COUNT} pages · PDF
          </p>
        </div>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full w-full origin-left rounded-full bg-primary"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={IN_VIEW}
          transition={{ duration: 1.1, ease: EASE, delay: 0.4 }}
        />
      </div>
    </div>
  );
}

function ActionVisual() {
  return (
    <div className="rounded-xl bg-background p-1.5 ring-1 ring-foreground/[0.08]">
      {ACTIONS.map((action) =>
        action === SELECTED_ACTION ? (
          <div
            key={action}
            className="flex items-center justify-between rounded-lg bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground"
          >
            {action}

            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={IN_VIEW}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.5,
              }}
            >
              <Check className="size-3.5" />
            </motion.span>
          </div>
        ) : (
          <div
            key={action}
            className="px-3 py-2.5 text-xs text-muted-foreground"
          >
            {action}
          </div>
        ),
      )}
    </div>
  );
}

function ResultVisual() {
  return (
    <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/[0.08]">
      <div className="divide-y divide-border">
        {EXTRACTED_VALUES.map(({ field, value }, index) => (
          <motion.div
            key={field}
            className="flex items-center gap-2 px-3.5 py-3"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={IN_VIEW}
            transition={{ duration: 0.5, ease: EASE, delay: 0.4 + index * 0.15 }}
          >
            <span className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-[9px] font-semibold text-primary">
              {index + 1}
            </span>

            <span className="text-xs text-muted-foreground">{field}</span>

            <span className="ml-auto whitespace-nowrap font-mono text-xs font-medium">
              {value}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 border-t border-border px-3.5 py-2.5 text-[10px] text-muted-foreground">
        <Check className="size-3 text-primary" />
        Traced to page 4, clause 3
      </p>
    </div>
  );
}

const VISUALS: ReactNode[] = [
  <UploadVisual key="upload" />,
  <ActionVisual key="action" />,
  <ResultVisual key="result" />,
];

export function StackedSteps() {
  const timelineRef = useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="px-6 pb-28 pt-20 md:pb-32 md:pt-28 lg:motion-safe:hidden">
      <div className="mx-auto max-w-xl">
        <motion.h2
          {...reveal()}
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          How it works
        </motion.h2>

        <ol ref={timelineRef} className="relative mt-12 flex flex-col gap-14">
          <span className="absolute inset-y-2 left-[3px] w-px bg-border" />
          <motion.span
            style={{ scaleY }}
            className="absolute inset-y-2 left-0.5 w-0.5 origin-top bg-primary"
          />

          {STEPS.map(({ number, title, description }, index) => (
            <li key={number} className="relative pl-8">
              <span className="absolute left-0 top-1.5 size-[7px] rounded-full bg-primary" />

              <motion.div {...reveal()}>
                <span className="font-mono text-xs text-muted-foreground">
                  {number}
                </span>

                <h3 className="mt-1 text-xl font-medium">{title}</h3>

                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </motion.div>

              <motion.div
                {...reveal(0.1)}
                className="mt-5 rounded-2xl bg-gray-100 p-2.5"
              >
                {VISUALS[index]}
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
