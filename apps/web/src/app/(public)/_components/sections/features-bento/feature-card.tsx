"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

const HOVER_QUERY = "(hover: hover)";

const CardActiveContext = createContext(false);

export function useCardActive() {
  return useContext(CardActiveContext);
}

function subscribeToHover(onChange: () => void) {
  const query = window.matchMedia(HOVER_QUERY);

  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

function useCanHover() {
  return useSyncExternalStore(
    subscribeToHover,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => true,
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function FeatureCard({
  title,
  description,
  children,
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const canHover = useCanHover();
  const reduceMotion = useReducedMotion();
  const inView = useInView(cardRef, { amount: 0.6 });
  const [hovered, setHovered] = useState(false);

  // Without a mouse there is no hover, so the panel plays while it's on screen.
  // With reduced motion it stays on its resting frame, which is complete.
  const active = !reduceMotion && (canHover ? hovered : inView);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${pointerX}px ${pointerY}px, color-mix(in oklch, var(--primary) 13%, transparent), transparent 70%)`;

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    pointerX.set(event.clientX - rect.left);
    pointerY.set(event.clientY - rect.top);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;

    trackPointer(event);
    setHovered(true);
  };

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={trackPointer}
      onPointerLeave={() => setHovered(false)}
      className="notched-card relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      <motion.div
        style={{ background: spotlight }}
        className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative">
        <h3 className="text-lg font-medium">{title}</h3>

        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="relative">
        <CardActiveContext.Provider value={active}>
          {children}
        </CardActiveContext.Provider>
      </div>
    </div>
  );
}
