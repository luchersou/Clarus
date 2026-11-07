"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUp, CalendarClock, Check, FileText } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

// Timeline of the scene, in seconds after it starts
const QUESTION_AT = 0.9;
const READING_AT = 1.3;
const ANSWER_AT = 2.1;
const STEP = 0.22;

const MAX_TILT = 2.5;

// The scene starts once the top of the window passes 60% of the viewport height.
// A line instead of a visible percentage, so it also fires on screens too short
// to show most of the window at once.
const START_LINE = "0px 0px -40% 0px";

const EXTRACTED_VALUES = [
  { field: "Total amount", value: "$48,750.00" },
  { field: "Due date", value: "Oct 15, 2027" },
  { field: "Late fee", value: "2% per month" },
];

const ACTIONS = [
  { label: "Summary", active: false },
  { label: "Extract values", active: true },
  { label: "Deadlines", active: false },
  { label: "Compare", active: false },
];

function fadeUp(delay: number) {
  return {
    variants: {
      hidden: { opacity: 0, y: 8 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE, delay },
      },
    },
  };
}

function Citation({ n }: { n: number }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-[9px] font-semibold text-primary">
      {n}
    </span>
  );
}

function Highlight({ n, children }: { n: number; children: ReactNode }) {
  const delay = ANSWER_AT + (n - 1) * STEP;

  return (
    <span className="relative inline-block whitespace-nowrap px-0.5 font-medium text-foreground">
      <motion.span
        variants={{
          hidden: { scaleX: 0 },
          show: {
            scaleX: 1,
            transition: { duration: 0.5, ease: EASE, delay },
          },
        }}
        className="absolute inset-0 origin-left rounded-[3px] bg-primary/15"
      />
      <span className="relative">{children}</span>
      <motion.sup
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { duration: 0.3, delay: delay + 0.3 },
          },
        }}
        className="relative ml-0.5 font-mono text-[8px] font-semibold text-primary"
      >
        {n}
      </motion.sup>
    </span>
  );
}

function DocumentPane() {
  return (
    <div className="relative hidden w-[46%] shrink-0 overflow-hidden border-r border-border bg-muted/60 px-5 pt-5 @xl:block">
      <div className="h-full rounded-t-md bg-background px-5 pt-5 font-[family-name:var(--font-geist)] text-[10.5px] leading-[1.7] text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.18)]">
        <p className="text-[9px] font-medium tracking-[0.16em] text-muted-foreground/80">
          SUPPLY AGREEMENT
        </p>

        <p className="mt-4 text-[11.5px] font-semibold text-foreground">
          3. Payment terms
        </p>

        <p className="mt-2">
          3.1 The Buyer shall pay the Supplier a total of{" "}
          <Highlight n={1}>$48,750.00</Highlight> for the goods listed in
          Schedule A.
        </p>

        <p className="mt-2">
          3.2 Payment is due in full on or before{" "}
          <Highlight n={2}>Oct 15, 2027</Highlight>, by wire transfer to the
          account named in the invoice.
        </p>

        <p className="mt-2">
          3.3 Overdue amounts accrue a late fee of{" "}
          <Highlight n={3}>2% per month</Highlight> until paid in full.
        </p>

        <p className="mt-4 text-[11.5px] font-semibold text-foreground">
          4. Delivery
        </p>

        <p className="mt-2">
          4.1 The Supplier shall deliver the goods to the address agreed by both
          parties, within the period set out in Schedule B.
        </p>

        <p className="mt-2">
          4.2 Risk in the goods passes to the Buyer on delivery, and title
          passes once payment has been received in full.
        </p>

        <p className="mt-2">
          4.3 The Buyer may inspect the goods within ten business days of
          delivery and reject any that do not conform to this agreement.
        </p>
      </div>

      {/* The page continues below the window */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-muted to-transparent" />
    </div>
  );
}

function AnswerPane() {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 @xl:p-5">
        <motion.div {...fadeUp(QUESTION_AT)} className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-xs text-background">
            What do we owe, and by when?
          </p>
        </motion.div>

        <div className="relative flex gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            C
          </span>

          <div className="relative min-w-0 flex-1">
            {/* Shown only while the document is being read */}
            <motion.p
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: [0, 1, 1, 0],
                  transition: {
                    duration: ANSWER_AT - READING_AT,
                    times: [0, 0.2, 0.8, 1],
                    delay: READING_AT,
                  },
                },
              }}
              className="absolute left-0 top-1 text-xs text-muted-foreground"
            >
              Reading page 4…
            </motion.p>

            <motion.p
              {...fadeUp(ANSWER_AT)}
              className="pt-1 text-xs leading-relaxed text-foreground"
            >
              These are the payment terms in your contract:
            </motion.p>

            <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl">
              {EXTRACTED_VALUES.map(({ field, value }, index) => (
                <motion.div
                  key={field}
                  {...fadeUp(ANSWER_AT + (index + 1) * STEP)}
                  className="flex items-center gap-2 bg-muted/60 px-3 py-2.5"
                >
                  <Citation n={index + 1} />

                  <span className="truncate text-[11px] text-muted-foreground">
                    {field}
                  </span>

                  <span className="ml-auto whitespace-nowrap font-mono text-[11px] font-medium">
                    {value}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.p
              {...fadeUp(ANSWER_AT + 4 * STEP)}
              className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground"
            >
              <Check className="size-3 text-primary" />
              Traced to page 4, clause 3
            </motion.p>

            <motion.div
              {...fadeUp(ANSWER_AT + 5 * STEP)}
              className="mt-3 hidden items-center gap-2.5 rounded-xl bg-primary/[0.07] px-3 py-2.5 sm:flex"
            >
              <CalendarClock className="size-3.5 shrink-0 text-primary" />

              <p className="text-[11px] leading-snug text-foreground/80">
                Late fees start if payment misses Oct 15.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="p-3 pt-0 @xl:px-5 @xl:pb-4">
        <div className="mb-2.5 hidden gap-1.5 sm:flex">
          {ACTIONS.map(({ label, active }) => (
            <span
              key={label}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground ring-1 ring-inset ring-border"
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-background py-1.5 pl-3.5 pr-1.5 shadow-[0_0_0_1px_var(--border),0_2px_6px_-2px_rgb(0_0_0/0.06)]">
          <span className="truncate text-[11px] text-muted-foreground">
            Ask about this document…
          </span>

          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ArrowUp className="size-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  const reduceMotion = useReducedMotion();

  const previewRef = useRef<HTMLDivElement>(null);
  const started = useInView(previewRef, { once: true, margin: START_LINE });

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 120, damping: 20, mass: 0.6 };
  const rotateY = useSpring(
    useTransform(pointerX, [-1, 1], [-MAX_TILT, MAX_TILT]),
    spring,
  );
  const rotateX = useSpring(
    useTransform(pointerY, [-1, 1], [MAX_TILT, -MAX_TILT]),
    spring,
  );

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    // Normalizes position between -1 and 1
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      ref={previewRef}
      role="img"
      aria-label="Clarus answering a question about a supplier contract, with each value linked to the clause it came from."
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="@container relative w-full"
    >
      <motion.div
        initial="hidden"
        animate={started ? "show" : "hidden"}
        style={{ rotateX, rotateY, transformPerspective: 1800 }}
        className="rounded-[1.25rem] bg-foreground/[0.04] p-1.5 shadow-[0_40px_80px_-32px_rgb(0_0_0/0.28),0_16px_32px_-20px_rgb(0_0_0/0.14)] ring-1 ring-foreground/[0.06] will-change-transform"
      >
        <div className="flex h-[25rem] flex-col overflow-hidden rounded-[0.875rem] bg-background ring-1 ring-foreground/[0.08] sm:h-[31rem] lg:h-[clamp(26rem,calc(100svh-11rem),33rem)]">
          {/* Window bar */}
          <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border px-4">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-foreground/10" />
              <span className="size-2.5 rounded-full bg-foreground/10" />
              <span className="size-2.5 rounded-full bg-foreground/10" />
            </div>

            <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium">
              <FileText className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">Supplier_Contract_2026.pdf</span>
            </div>

            <span className="ml-auto hidden whitespace-nowrap font-mono text-[10px] text-muted-foreground @md:block">
              Page 4 of 12
            </span>
          </div>

          <div className="flex min-h-0 flex-1">
            <DocumentPane />
            <AnswerPane />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
