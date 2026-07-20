"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, CalendarClock, Truck, LayoutDashboard, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPickupDisplay } from "@/lib/resident-data";
import { formatSlotSummary } from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { ConfettiBurst } from "../_components/confetti";
import { springSoft, staggerContainer, staggerItem } from "../_components/motion-primitives";

export function SuccessStep() {
  const { bookingId, selectedSlot, resetBooking } = usePickup();

  const pickupLabel = selectedSlot
    ? `${selectedSlot.date} · ${formatSlotSummary(selectedSlot)}`
    : "Scheduled";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border bg-card px-6 py-12 text-center shadow-[0_24px_60px_-36px_rgba(16,181,184,0.55)] md:px-10 md:py-16">
      <ConfettiBurst />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-lg flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springSoft}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#10B5B8] text-white shadow-lg shadow-primary/30"
        >
          <Check className="h-10 w-10" strokeWidth={2.5} />
        </motion.div>

        <motion.h2
          variants={staggerItem}
          className="font-display text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Pickup scheduled
        </motion.h2>
        <motion.p
          variants={staggerItem}
          className="mt-3 text-sm text-muted-foreground md:text-base"
        >
          You’re all set. We’ll notify you when your executive is on the way.
        </motion.p>

        <motion.div
          variants={staggerItem}
          className="mt-8 w-full space-y-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-secondary/10 p-5 text-left"
        >
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Booking ID
              </p>
              <p className="font-semibold tabular-nums">{bookingId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pickup date
              </p>
              <p className="font-semibold">{pickupLabel}</p>
              {selectedSlot && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPickupDisplay({
                    id: bookingId ?? "temp",
                    date: selectedSlot.date,
                    startTime: selectedSlot.startTime24h,
                    endTime: selectedSlot.endTime24h,
                    window: selectedSlot.window,
                    status: "scheduled",
                  })}
                </p>
              )}
            </div>
          </div>
          <p className="rounded-xl bg-card/80 px-3 py-2 text-sm text-muted-foreground">
            Executive will arrive during your selected window. Estimated arrival aligns with{" "}
            <span className="font-medium text-foreground">
              {selectedSlot
                ? `${selectedSlot.startTime24h} – ${selectedSlot.endTime24h}`
                : "your slot"}
            </span>
            .
          </p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
        >
          <Link href="/resident/orders" className="no-underline">
            <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-[#10B5B8] px-6 shadow-md shadow-primary/20 transition duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto">
              Track Pickup
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl transition duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            onClick={resetBooking}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Schedule Another Pickup
          </Button>
          <Link href="/resident/dashboard" className="no-underline">
            <Button
              variant="ghost"
              className="h-11 w-full rounded-xl transition duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
