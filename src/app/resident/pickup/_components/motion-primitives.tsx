"use client";

import { useReducedMotion, type Transition, type Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const springSoft = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};

export function useMotionPrefs() {
  const reduce = useReducedMotion();
  const duration = reduce ? 0.01 : 0.3;
  const transition: Transition = reduce
    ? { duration: 0.01 }
    : { duration, ease: EASE };

  return { reduce: Boolean(reduce), duration, transition, spring: springSoft };
}

export function stepVariants(direction: 1 | -1): Variants {
  return {
    enter: {
      opacity: 0,
      x: direction > 0 ? 28 : -28,
      y: 12,
    },
    center: {
      opacity: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      x: direction > 0 ? -28 : 28,
      y: -8,
    },
  };
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
};
