"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Check, Upload } from "lucide-react";
import {
  ACTIONS,
  EXTRACTED_VALUES,
  PAGE_COUNT,
  SELECTED_ACTION,
  STEPS,
} from "./steps";

// The scene is laid out on a fixed canvas and scaled to fit the stage, which is
// what lets the connectors below use plain coordinates.
const CANVAS = { width: 720, height: 520 };
const PAGE = { width: 290, height: 430, top: 45, centerX: 215, sideX: 40 };
const PANEL = { x: 430, y: 130, width: 250 };
const ROW = { pageTop: 120, pageHeight: 28, panelHeight: 44 };
const PAGE_MARGIN = 22;

// Where each step starts, as a share of the scroll through the section. The
// scene finishes before the end so the last frame holds for a moment.
const STEP_2_AT = 0.3;
const STEP_3_AT = 0.6;
const SCENE_END = 0.92;

const READ_START = 0.1;
const READ_END = 0.28;
const VALUE_GAP = 0.08;

const SELECTED_INDEX = ACTIONS.indexOf(SELECTED_ACTION);

type Progress = { progress: MotionValue<number> };

function valueStart(index: number) {
  return STEP_3_AT + 0.06 + index * VALUE_GAP;
}

function useStageScale() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setScale(Math.min(width / CANVAS.width, height / CANVAS.height));
    });

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  return { stageRef, scale };
}

function DropZone({ progress }: Progress) {
  const opacity = useTransform(progress, [0.06, 0.12], [1, 0]);

  return (
    <motion.div
      style={{
        opacity,
        left: PAGE.centerX,
        top: PAGE.top,
        width: PAGE.width,
        height: PAGE.height,
      }}
      className="absolute flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-foreground/20 text-center"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
        <Upload className="size-4" />
      </span>

      <p className="max-w-40 text-balance text-xs leading-relaxed text-muted-foreground">
        Drop a contract, invoice, or report
      </p>
    </motion.div>
  );
}

function ClauseRow({
  index,
  progress,
}: Progress & {
  index: number;
}) {
  const { clause, value } = EXTRACTED_VALUES[index];
  const start = valueStart(index);
  const scaleX = useTransform(progress, [start, start + 0.04], [0, 1]);

  return (
    <div
      style={{ height: ROW.pageHeight }}
      className="flex items-center gap-2"
    >
      <span className="whitespace-nowrap">{clause}</span>

      <span className="h-px flex-1 border-b border-dotted border-foreground/20" />

      <span className="relative whitespace-nowrap px-1 font-medium text-foreground">
        <motion.span
          style={{ scaleX }}
          className="absolute inset-0 origin-left rounded-[3px] bg-primary/15"
        />
        <span className="relative">{value}</span>
      </span>
    </div>
  );
}

function ContractPage({ progress }: Progress) {
  const x = useTransform(
    progress,
    [STEP_2_AT, STEP_2_AT + 0.1],
    [PAGE.centerX, PAGE.sideX],
  );
  const y = useTransform(progress, [0.02, 0.11], [-CANVAS.height, PAGE.top]);
  const rotate = useTransform(progress, [0.02, 0.11], [-5, 0]);

  const clipPath = useTransform(
    progress,
    [READ_START, READ_END],
    ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
  );
  const scanTop = useTransform(
    progress,
    [READ_START, READ_END],
    [0, PAGE.height],
  );
  const scanOpacity = useTransform(
    progress,
    [READ_START, READ_START + 0.01, READ_END - 0.01, READ_END],
    [0, 1, 1, 0],
  );

  return (
    <motion.div
      style={{ x, y, rotate, width: PAGE.width, height: PAGE.height }}
      className="absolute left-0 top-0 overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_30px_60px_-30px_rgb(0_0_0/0.3)]"
    >
      <motion.div
        style={{ clipPath, paddingInline: PAGE_MARGIN }}
        className="absolute inset-0 pt-6 font-[family-name:var(--font-geist)] text-[10.5px] leading-[1.7] text-muted-foreground"
      >
        <div className="flex items-center justify-between text-[9px] font-medium tracking-[0.16em] text-muted-foreground/80">
          <span>SUPPLY AGREEMENT</span>
          <span>PAGE 4</span>
        </div>

        <p className="mt-4 text-[11.5px] font-semibold text-foreground">
          3. Payment terms
        </p>

        <p className="mt-1">
          The Buyer shall pay the Supplier as set out below, by wire transfer
          to the named account.
        </p>

        <div
          style={{ top: ROW.pageTop, insetInline: PAGE_MARGIN }}
          className="absolute"
        >
          {EXTRACTED_VALUES.map(({ field }, index) => (
            <ClauseRow key={field} index={index} progress={progress} />
          ))}
        </div>

        <div className="absolute inset-x-[22px] top-[222px]">
          <p className="text-[11.5px] font-semibold text-foreground">
            4. Delivery
          </p>

          <p className="mt-1">
            4.1 The Supplier shall deliver the goods to the address agreed by
            both parties, within the period set out in Schedule B.
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
      </motion.div>

      {/* Reading line */}
      <motion.div
        style={{ y: scanTop, opacity: scanOpacity }}
        className="absolute inset-x-0 top-0"
      >
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-primary/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
      </motion.div>
    </motion.div>
  );
}

function ReadingChip({ progress }: Progress) {
  const opacity = useTransform(
    progress,
    [0.08, 0.11, STEP_2_AT - 0.01, STEP_2_AT + 0.02],
    [0, 1, 1, 0],
  );
  const page = useTransform(
    progress,
    [READ_START, READ_END],
    [1, PAGE_COUNT],
  );
  const pageNumber = useTransform(page, (value) => Math.round(value));
  const scaleX = useTransform(progress, [READ_START, READ_END], [0, 1]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3"
    >
      <span className="font-mono text-[10px] text-muted-foreground">
        Reading page <motion.span>{pageNumber}</motion.span> of {PAGE_COUNT}
      </span>

      <span className="h-1 w-16 overflow-hidden rounded-full bg-foreground/10">
        <motion.span
          style={{ scaleX }}
          className="block h-full origin-left rounded-full bg-primary"
        />
      </span>
    </motion.div>
  );
}

function ActionPanel({ progress }: Progress) {
  const opacity = useTransform(
    progress,
    [STEP_2_AT + 0.05, STEP_2_AT + 0.1, STEP_3_AT - 0.01, STEP_3_AT + 0.03],
    [0, 1, 1, 0],
  );
  const x = useTransform(
    progress,
    [STEP_2_AT + 0.05, STEP_2_AT + 0.11],
    [24, 0],
  );

  const pointerY = useTransform(
    progress,
    [0.42, 0.48],
    [0, SELECTED_INDEX * ROW.panelHeight],
  );
  const confirmed = useTransform(progress, [0.5, 0.53], [0, 1]);

  return (
    <motion.div
      style={{ opacity, x, left: PANEL.x, top: PANEL.y, width: PANEL.width }}
      className="absolute overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_24px_48px_-28px_rgb(0_0_0/0.3)]"
    >
      <p className="flex h-11 items-center border-b border-border px-4 text-xs font-medium">
        What should Clarus do?
      </p>

      <div className="relative p-1.5">
        <motion.div
          style={{ y: pointerY, height: ROW.panelHeight }}
          className="absolute inset-x-1.5 top-1.5 rounded-lg bg-primary/10"
        />

        {ACTIONS.map((action) => (
          <div
            key={action}
            style={{ height: ROW.panelHeight }}
            className="relative flex items-center px-3 text-xs text-muted-foreground"
          >
            {action}
          </div>
        ))}

        <motion.div
          style={{
            opacity: confirmed,
            height: ROW.panelHeight,
            top: 6 + SELECTED_INDEX * ROW.panelHeight,
          }}
          className="absolute inset-x-1.5 flex items-center justify-between rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
        >
          {SELECTED_ACTION}
          <Check className="size-3.5" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function ResultRow({ index, progress }: Progress & { index: number }) {
  const { field, value } = EXTRACTED_VALUES[index];
  const start = valueStart(index) + 0.07;
  const opacity = useTransform(progress, [start, start + 0.03], [0, 1]);
  const x = useTransform(progress, [start, start + 0.03], [-8, 0]);

  return (
    <motion.div
      style={{ opacity, x, height: ROW.panelHeight }}
      className="flex items-center gap-2 px-4"
    >
      <span className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-[9px] font-semibold text-primary">
        {index + 1}
      </span>

      <span className="text-[11px] text-muted-foreground">{field}</span>

      <span className="ml-auto whitespace-nowrap font-mono text-[11px] font-medium">
        {value}
      </span>
    </motion.div>
  );
}

function ResultPanel({ progress }: Progress) {
  const opacity = useTransform(
    progress,
    [STEP_3_AT + 0.01, STEP_3_AT + 0.05],
    [0, 1],
  );
  const lastRow = valueStart(EXTRACTED_VALUES.length - 1) + 0.1;
  const footerOpacity = useTransform(
    progress,
    [lastRow, lastRow + 0.02],
    [0, 1],
  );

  return (
    <motion.div
      style={{ opacity, left: PANEL.x, top: PANEL.y, width: PANEL.width }}
      className="absolute overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_24px_48px_-28px_rgb(0_0_0/0.3)]"
    >
      <p className="flex h-11 items-center border-b border-border px-4 text-xs font-medium">
        {SELECTED_ACTION}
      </p>

      <div className="divide-y divide-border">
        {EXTRACTED_VALUES.map(({ field }, index) => (
          <ResultRow key={field} index={index} progress={progress} />
        ))}
      </div>

      <motion.p
        style={{ opacity: footerOpacity }}
        className="flex h-10 items-center gap-1.5 border-t border-border px-4 text-[10px] text-muted-foreground"
      >
        <Check className="size-3 text-primary" />
        Traced to page 4, clause 3
      </motion.p>
    </motion.div>
  );
}

function Connector({ index, progress }: Progress & { index: number }) {
  const fromX = PAGE.sideX + PAGE.width - PAGE_MARGIN;
  const fromY =
    PAGE.top + ROW.pageTop + ROW.pageHeight * index + ROW.pageHeight / 2;
  const toX = PANEL.x;
  const toY = PANEL.y + 44 + ROW.panelHeight * index + ROW.panelHeight / 2;
  const middleX = (fromX + toX) / 2;

  const start = valueStart(index) + 0.03;
  const pathLength = useTransform(progress, [start, start + 0.05], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.005], [0, 1]);
  const endOpacity = useTransform(
    progress,
    [start + 0.045, start + 0.05],
    [0, 1],
  );

  return (
    <>
      <motion.circle
        cx={fromX}
        cy={fromY}
        r={2.5}
        style={{ opacity }}
        className="fill-primary"
      />

      <motion.path
        d={`M ${fromX} ${fromY} C ${middleX} ${fromY}, ${middleX} ${toY}, ${toX} ${toY}`}
        style={{ pathLength, opacity }}
        className="fill-none stroke-primary"
        strokeWidth={1.25}
      />

      <motion.circle
        cx={toX}
        cy={toY}
        r={2.5}
        style={{ opacity: endOpacity }}
        className="fill-primary"
      />
    </>
  );
}

function Stage({ progress }: Progress) {
  const { stageRef, scale } = useStageScale();

  return (
    <div
      ref={stageRef}
      role="img"
      aria-label="A supplier contract is uploaded and read, the Extract values action is chosen, and each value is linked back to its clause on the page."
      className="relative h-[min(calc(100svh-8rem),38rem)] w-full overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-foreground/5"
    >
      <div className="pointer-events-none absolute inset-0 text-foreground/[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div
        style={{
          width: CANVAS.width,
          height: CANVAS.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
        className="absolute left-1/2 top-1/2"
      >
        <DropZone progress={progress} />
        <ContractPage progress={progress} />
        <ActionPanel progress={progress} />
        <ResultPanel progress={progress} />

        <svg
          viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
          className="pointer-events-none absolute inset-0"
        >
          {EXTRACTED_VALUES.map(({ field }, index) => (
            <Connector key={field} index={index} progress={progress} />
          ))}
        </svg>

        <ReadingChip progress={progress} />
      </div>
    </div>
  );
}

function StepList({
  active,
  progress,
}: Progress & {
  active: number;
}) {
  const scaleY = useTransform(progress, [0, SCENE_END], [0, 1]);

  return (
    <ol className="relative mt-10">
      <span className="absolute inset-y-2 left-[3px] w-px bg-border" />
      <motion.span
        style={{ scaleY }}
        className="absolute inset-y-2 left-0.5 w-0.5 origin-top bg-primary"
      />

      {STEPS.map(({ number, title, description }, index) => (
        <li
          key={number}
          aria-current={index === active ? "step" : undefined}
          className={`relative py-4 pl-8 transition-opacity duration-500 ${
            index === active ? "opacity-100" : "opacity-40"
          }`}
        >
          <span
            className={`absolute left-0 top-[1.6rem] size-[7px] rounded-full transition-colors duration-500 ${
              index <= active ? "bg-primary" : "bg-border"
            }`}
          />

          <span className="font-mono text-xs text-muted-foreground">
            {number}
          </span>

          <h3 className="mt-1 text-xl font-medium">{title}</h3>

          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function PinnedStory() {
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    restDelta: 0.0005,
  });

  const [active, setActive] = useState(0);

  useMotionValueEvent(progress, "change", (value) => {
    if (value < STEP_2_AT) setActive(0);
    else if (value < STEP_3_AT) setActive(1);
    else setActive(2);
  });

  return (
    <div
      ref={trackRef}
      className="relative hidden h-[340svh] lg:motion-safe:block"
    >
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,4fr)_minmax(0,7fr)] items-center gap-14 px-10 pt-20 2xl:max-w-[88rem]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              How it works
            </h2>

            <StepList active={active} progress={progress} />
          </div>

          <Stage progress={progress} />
        </div>
      </div>
    </div>
  );
}
