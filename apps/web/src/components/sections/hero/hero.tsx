"use client";

import { motion, MotionConfig, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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
      <section className="relative px-2 pb-2 md:px-6 bg-gray-100">
        {/* Background grids */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="
            pointer-events-none absolute -right-0 -top-0
            h-80 md:h-124 w-80 md:w-140
            [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]
            [background-size:52px_52px]
            text-foreground
            [mask-image:linear-gradient(to_bottom_left,black,transparent_75%)]
          "
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          className="
            pointer-events-none absolute bottom-22 md:-bottom-0 -left-0
            h-80 md:h-124 w-80 md:w-140
            [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]
            [background-size:52px_52px]
            text-foreground
            [mask-image:linear-gradient(to_top_right,black,transparent_75%)]
          "
        />

        <div className="relative overflow-hidden pb-15">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative flex flex-col items-center gap-8 px-8 pt-20 md:pt-30 text-center md:px-16"
          >
            <motion.h1
              variants={item}
              className="text-6xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
            >
              Ask your documents.
            </motion.h1>

            <motion.p
              variants={item}
              className="max-w-md text-lg text-muted-foreground"
            >
              Clarus reads your financial documents and answers with precision —
              no more digging through pages to find what matters.
            </motion.p>

            <motion.div variants={item} className="flex gap-3">
              <Button size="lg">Get started for free</Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        >
          <DashboardPreview />
        </motion.div>
      </section>
    </MotionConfig>
  );
}