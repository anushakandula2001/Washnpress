"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PICKUP_STEPS } from "../_data/pickup-constants";
import type { PickupStepId } from "../_types/pickup.types";
import { springSoft, useMotionPrefs } from "./motion-primitives";

function stepIndex(step: PickupStepId): number {
  if (step === "success") return PICKUP_STEPS.length;
  return PICKUP_STEPS.findIndex((s) => s.id === step);
}

export function PickupStepper({ current }: { current: PickupStepId }) {
  const { reduce } = useMotionPrefs();
  const activeIdx = Math.min(stepIndex(current), PICKUP_STEPS.length - 1);
  const progress = activeIdx / Math.max(PICKUP_STEPS.length - 1, 1);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:p-6">
      <div className="relative">
        <div className="absolute left-[12%] right-[12%] top-5 h-1 rounded-full bg-muted md:top-6" />
        <motion.div
          className="absolute left-[12%] top-5 h-1 origin-left rounded-full bg-gradient-to-r from-primary to-secondary md:top-6"
          style={{ width: "76%" }}
          initial={false}
          animate={{ scaleX: progress }}
          transition={reduce ? { duration: 0.01 } : { duration: 0.35, ease: "easeInOut" }}
        />

        <ol className="relative z-10 flex justify-between">
          {PICKUP_STEPS.map((step, idx) => {
            const completed = idx < activeIdx || current === "success";
            const active = idx === activeIdx && current !== "success";

            return (
              <li key={step.id} className="flex w-16 flex-col items-center gap-2 md:w-24">
                <motion.div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold md:h-12 md:w-12",
                    completed && "border-primary bg-primary text-primary-foreground",
                    active &&
                      "border-primary bg-primary/10 text-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_18%,transparent)]",
                    !completed && !active && "border-border bg-card text-muted-foreground",
                  )}
                  initial={active ? { scale: 0.9 } : false}
                  animate={{ scale: 1 }}
                  transition={reduce ? { duration: 0.01 } : springSoft}
                >
                  {completed ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : idx + 1}
                </motion.div>
                <span
                  className={cn(
                    "text-center text-[11px] font-medium md:text-xs",
                    active || completed ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="md:hidden">{step.shortLabel}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
