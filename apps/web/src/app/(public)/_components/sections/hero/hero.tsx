"use client";

import Link from "next/link";
import { motion, MotionConfig, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden bg-gray-100">
        {/* Background grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="
            pointer-events-none absolute inset-0 -z-10
            [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]
            [background-size:52px_52px]
            text-foreground
            [mask-image:radial-gradient(ellipse_70%_75%_at_72%_42%,black,transparent)]
          "
        />

        {/* Blends into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background" />

        <div className="mx-auto grid min-h-svh w-full max-w-7xl items-center gap-12 px-6 pb-12 pt-28 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:pb-10 lg:pt-24 2xl:max-w-[88rem]">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.p
              variants={item}
              className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/70"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              AI for financial documents
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl 2xl:text-[5.25rem]"
            >
              Ask your documents.
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-5 max-w-md text-pretty text-base leading-relaxed text-foreground/70 md:text-lg"
            >
              Clarus reads your financial documents and answers with precision —
              no more digging through pages to find what matters.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/login" />}
                className="group h-11 gap-2 px-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.2),0_10px_24px_-10px_var(--primary)]"
              >
                Get started for free
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>

              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<Link href="/#how-it-works" />}
                className="h-11 px-4 hover:bg-foreground/5"
              >
                See how it works
              </Button>
            </motion.div>

            <motion.p
              variants={item}
              className="mt-6 text-xs text-muted-foreground"
            >
              PDF, DOCX and XLSX · Every value traced to its page
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            className="relative mx-auto w-full max-w-2xl lg:max-w-none"
          >
            {/* Glow behind the window */}
            <div className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]" />

            <DashboardPreview />
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
