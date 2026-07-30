"use client";

import { motion } from "framer-motion";
import { usePickup } from "../hooks/use-pickup";
import { springSoft, staggerContainer, staggerItem, useMotionPrefs } from "../_components/motion-primitives";
import { cn } from "@/lib/utils/cn";

export function DateStep() {
  const { dates, selectedDate, setDate, slotsLoading } = usePickup();
  const { reduce } = useMotionPrefs();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Choose a pickup date
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Pick a date that works for you; we’ll assign the best available pickup window automatically.
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

      <div className="rounded-[24px] border border-border bg-card p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Automatic pickup window</p>
        <p className="mt-2">
          We’ll book the best available pickup window for your selected date.
        </p>
      </div>

      {slotsLoading && (
        <div className="rounded-[24px] border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading availability…
        </div>
      )}
    </div>
  );
}
