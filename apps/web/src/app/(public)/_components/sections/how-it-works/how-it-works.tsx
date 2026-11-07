"use client";

import { MotionConfig } from "motion/react";
import { PinnedStory } from "./pinned-story";
import { StackedSteps } from "./stacked-steps";

export function HowItWorks() {
  return (
    <MotionConfig reducedMotion="user">
      {/* The pinned stage is centered, so the space under it grows with the
          viewport height. The padding tops it up on shorter screens, where it's tight. */}
      <section
        id="how-it-works"
        className="lg:motion-safe:pb-[clamp(0px,calc(29rem-50svh),6rem)]"
      >
        <PinnedStory />
        <StackedSteps />
      </section>
    </MotionConfig>
  );
}
