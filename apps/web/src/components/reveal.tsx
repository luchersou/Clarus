"use client";

import { motion, MotionConfig, type HTMLMotionProps } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  x?: number;
  y?: number;
};

export function Reveal({ delay = 0, x = 0, y = 32, ...props }: RevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, x, y }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: EASE, delay }}
        {...props}
      />
    </MotionConfig>
  );
}