"use client";

import { MotionConfig } from "motion/react";
import { PinnedStory } from "./pinned-story";
import { StackedSteps } from "./stacked-steps";

export function HowItWorks() {
  return (
    <MotionConfig reducedMotion="user">
      <section id="how-it-works">
        <PinnedStory />
        <StackedSteps />
      </section>
    </MotionConfig>
  );
}
