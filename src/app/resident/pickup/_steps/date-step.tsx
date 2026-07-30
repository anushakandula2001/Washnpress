"use client";

import { motion } from "framer-motion";
import { usePickup } from "../hooks/use-pickup";
import { formatSlotSummary } from "../_data/pickup-constants";
import { springSoft, staggerContainer, staggerItem, useMotionPrefs } from "../_components/motion-primitives";
import type { TimeWindow } from "@/lib/types";
import { Check, Sun, Sunset, Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PickupSlotOption } from "../_types/pickup.types";

const WINDOW_META: Record<TimeWindow, { icon: typeof Sun; hint: string }> = {
  Morning: { icon: Sun, hint: "Start fresh" },
  Afternoon: { icon: Sunset, hint: "Midday window" },
  Evening: { icon: Moon, hint: "After work" },
};

export function DateStep() {
  const { dates, selectedDate, setDate, slots, slotsLoading } = usePickup();
  const { reduce } = useMotionPrefs();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Choose a pickup date
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Pick a date that fits your schedule. We will confirm a slot in the following step.
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Date
        </p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {dates.map((date) => {
            const active = selectedDate === date.iso;
            return (
              <motion.button
                key={date.iso}
                type="button"
                variants={staggerItem}
                onClick={() => setDate(date.iso)}
                animate={active ? { scale: reduce ? 1 : 1.03 } : { scale: 1 }}
                whileHover={{ y: -4 }}
                transition={springSoft}
                className={cn(
                  "min-w-[84px] shrink-0 rounded-2xl border px-3 py-3 text-center transition-colors duration-300",
                  active
                    ? "border-primary bg-gradient-to-b from-primary to-[#10B5B8] text-primary-foreground shadow-lg shadow-primary/25"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                <p className={cn("text-xs font-medium", active ? "text-white/85" : "text-muted-foreground")}>{date.label}</p>
                <p className="mt-1 text-xl font-bold leading-none">{date.dayNumber}</p>
                <p className={cn("mt-1 text-[11px]", active ? "text-white/80" : "text-muted-foreground")}>{date.monthShort}</p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div className="space-y-7">
        {slotsLoading ? (
          <div className="rounded-[24px] border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading available windows…
          </div>
        ) : (
          Array.from(new Set(slots.map((slot) => slot.window))).map((window) => {
            const group = slots.filter((slot) => slot.window === window && slot.date === selectedDate);
            if (group.length === 0) return null;
            const meta = WINDOW_META[window];
            return (
              <section key={window} className="rounded-[24px] border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <meta.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{window}</p>
                    <p className="text-sm text-muted-foreground">{meta.hint}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.map((slot) => (
                    <div key={slot.id} className="rounded-2xl border border-border p-4">
                      <p className="font-semibold">{formatSlotSummary(slot)}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{slot.availability}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
