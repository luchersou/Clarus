"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_DURATION = 520;
const SCRAMBLE_GLYPHS = "0123456789abcdef#%&*+=/";

/** Moves through the items while active. The first move is immediate. */
export function useCycle(
  active: boolean,
  count: number,
  interval: number,
  start = 0,
) {
  const [index, setIndex] = useState(start);

  useEffect(() => {
    if (!active) return;

    const next = () => setIndex((current) => (current + 1) % count);
    const first = setTimeout(next, 0);
    const timer = setInterval(next, interval);

    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [active, count, interval]);

  return index;
}

/** Counts from 1 up to total while active, starting at once, and resets to 0. */
export function useSteps(active: boolean, total: number, interval: number) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      current += 1;
      setStep(current);

      if (current < total) timer = setTimeout(advance, interval);
    };

    timer = setTimeout(active ? advance : () => setStep(0), 0);

    return () => clearTimeout(timer);
  }, [active, total, interval]);

  return step;
}

function scramble(text: string, amount: number) {
  const cut = Math.round(amount * text.length);

  return [...text]
    .map((character, index) => {
      if (index >= cut || character === " ") return character;

      return SCRAMBLE_GLYPHS[
        Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)
      ];
    })
    .join("");
}

/** Turns the text into ciphertext from left to right, and back when inactive. */
export function useScramble(text: string, active: boolean) {
  const [output, setOutput] = useState(text);
  const amount = useRef(0);

  useEffect(() => {
    const target = active ? 1 : 0;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const step = (now - last) / SCRAMBLE_DURATION;

      last = now;
      amount.current =
        target > amount.current
          ? Math.min(target, amount.current + step)
          : Math.max(target, amount.current - step);

      setOutput(scramble(text, amount.current));

      if (amount.current !== target) frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [active, text]);

  return output;
}
