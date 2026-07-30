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

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:p-6">
      <div className="relative">
        <div className="absolute inset-x-6 top-6 h-px bg-muted" />

        <ol className="relative z-10 flex items-center justify-between gap-4">
          {PICKUP_STEPS.map((step, idx) => {
            const completed = idx < activeIdx || current === "success";
            const active = idx === activeIdx && current !== "success";

            return (
              <li key={step.id} className="flex min-w-[72px] flex-col items-center gap-2 text-center">
                <motion.div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    completed && "border-emerald-500 bg-emerald-500 text-white",
                    active && "border-primary bg-primary text-primary-foreground shadow-[0_0_0_6px_rgba(16,181,184,0.15)]",
                    !completed && !active && "border-border bg-card text-muted-foreground",
                  )}
                  initial={active ? { scale: 0.95 } : false}
                  animate={{ scale: 1 }}
                  transition={reduce ? { duration: 0.01 } : springSoft}
                >
                  {completed ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                </motion.div>
                <span className={cn("text-[11px] font-medium leading-tight", active || completed ? "text-foreground" : "text-muted-foreground")}> 
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
