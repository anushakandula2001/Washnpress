"use client";

import { motion } from "framer-motion";
import { Check, Sun, Sunset, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { TimeWindow } from "@/lib/types";
import type { PickupSlotOption, SlotAvailability } from "../_types/pickup.types";
import { usePickup } from "../hooks/use-pickup";
import { springSoft, staggerContainer, staggerItem, useMotionPrefs } from "../_components/motion-primitives";

const WINDOW_META: Record<TimeWindow, { icon: typeof Sun; hint: string }> = {
  Morning: { icon: Sun, hint: "Start fresh" },
  Afternoon: { icon: Sunset, hint: "Midday window" },
  Evening: { icon: Moon, hint: "After work" },
};

const AVAILABILITY_STYLES: Record<SlotAvailability, { label: string; dot: string; text: string }> = {
  available: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-600" },
  few: { label: "Few left", dot: "bg-amber-500", text: "text-amber-600" },
  booked: { label: "Booked", dot: "bg-slate-400", text: "text-muted-foreground" },
};

function SlotChip({
  slot,
  selected,
  onSelect,
}: {
  slot: PickupSlotOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const booked = slot.availability === "booked";
  const meta = AVAILABILITY_STYLES[slot.availability];

  return (
    <motion.button
      type="button"
      disabled={booked}
      onClick={onSelect}
      whileHover={booked ? undefined : { y: -3, scale: 1.02 }}
      whileTap={booked ? undefined : { scale: 0.98 }}
      transition={springSoft}
      className={cn(
        "relative flex min-w-[140px] flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition-colors duration-300",
        booked && "cursor-not-allowed opacity-50",
        selected
          ? "border-primary bg-primary/10 shadow-[0_10px_30px_-16px_rgba(16,181,184,0.8)]"
          : "border-border bg-card hover:border-primary/50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{slot.label}</span>
        {selected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springSoft}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Check className="h-3 w-3" />
          </motion.span>
        )}
      </div>
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.text)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
        {meta.label}
      </span>
    </motion.button>
  );
}

export function SlotStep() {
  const { dates, slots, selectedDate, selectedSlotId, slotsLoading, setDate, setSlot } =
    usePickup();
  const { reduce } = useMotionPrefs();
  const daySlots = slots.filter((s) => s.date === selectedDate);
  const windows = ["Morning", "Afternoon", "Evening"] as TimeWindow[];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Choose a pickup slot
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
          Pick a day, then select a convenient morning, afternoon, or evening window.
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
                <p className={cn("text-xs font-medium", active ? "text-white/85" : "text-muted-foreground")}>
                  {date.label}
                </p>
                <p className="mt-1 text-xl font-bold leading-none">{date.dayNumber}</p>
                <p className={cn("mt-1 text-[11px]", active ? "text-white/80" : "text-muted-foreground")}>
                  {date.monthShort}
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {slotsLoading ? (
        <div className="space-y-6">
          {windows.map((w) => (
            <div key={w} className="space-y-3">
              <Skeleton className="h-5 w-28 rounded-full" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-[72px] w-[150px] rounded-2xl" />
                <Skeleton className="h-[72px] w-[150px] rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          key={selectedDate ?? "none"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-7"
        >
          {windows.map((window) => {
            const Icon = WINDOW_META[window].icon;
            const group = daySlots.filter((s) => s.window === window);
            if (group.length === 0) return null;
            return (
              <section key={window}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{window}</h3>
                    <p className="text-xs text-muted-foreground">{WINDOW_META[window].hint}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {group.map((slot) => (
                    <SlotChip
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlotId === slot.id}
                      onSelect={() => setSlot(slot.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
