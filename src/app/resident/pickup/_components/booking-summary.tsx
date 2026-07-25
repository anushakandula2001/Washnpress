"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Phone,
  Clock3,
  FileText,
  Pencil,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useResident } from "@/components/resident/resident-provider";
import {
  formatSlotSummary,
  totalGarmentCount,
  estimateWeightKg,
  computeCharges,
} from "../_data/pickup-constants";
import type { GarmentOption, PickupSlotOption, PickupStepId, ServiceOption } from "../_types/pickup.types";
import { useMotionPrefs } from "./motion-primitives";

type BookingSummaryProps = {
  step: PickupStepId;
  selectedSlot: PickupSlotOption | null;
  garments: Record<string, number>;
  selectedServiceIds: string[];
  instructions: string;
  serviceOptions?: ServiceOption[];
  garmentOptions?: GarmentOption[];
  taxRate?: number;
  deliveryFee?: number;
  className?: string;
};

function SummaryRow({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {action}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-0.5 text-sm font-semibold text-foreground"
          >
            {value}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function BookingSummary({
  step,
  selectedSlot,
  garments,
  selectedServiceIds,
  instructions,
  serviceOptions = [],
  garmentOptions = [],
  taxRate = 0.05,
  deliveryFee = 0,
  className,
}: BookingSummaryProps) {
  const { transition } = useMotionPrefs();
  const { profile } = useResident();
  const itemCount = totalGarmentCount(garments);
  const weight = estimateWeightKg(garments, garmentOptions.length ? garmentOptions : undefined);
  const charges = computeCharges(
    selectedServiceIds,
    serviceOptions.length ? serviceOptions : undefined,
    taxRate,
    deliveryFee,
  );
  const selectedServices = serviceOptions.filter((s) => selectedServiceIds.includes(s.id));

  if (step === "success") return null;

  return (
    <aside
      className={cn(
        "rounded-[22px] border border-border/80 bg-card p-6 shadow-[0_12px_40px_-24px_rgba(16,181,184,0.45)] lg:sticky lg:top-24",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Booking summary
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold">Your pickup</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/30 text-primary">
          <Package className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-5">
        <SummaryRow
          icon={MapPin}
          label="Pickup address"
          value={profile?.society || "—"}
          action={
            <a
              href="/resident/profile"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary no-underline hover:bg-primary/10"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </a>
          }
        />
        <SummaryRow
          icon={Building2}
          label="Apartment"
          value={`Flat ${profile?.flatNumber || "—"}, ${profile?.tower || "—"}`}
        />
        <SummaryRow
          icon={Phone}
          label="Phone number"
          value={`+91 ${profile?.mobile || "—"}`}
          action={
            <a
              href="/resident/profile"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary no-underline hover:bg-primary/10"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </a>
          }
        />
        <SummaryRow
          icon={Clock3}
          label="Selected slot"
          value={
            selectedSlot
              ? `${selectedSlot.date} · ${formatSlotSummary(selectedSlot)}`
              : "Not selected yet"
          }
        />
        <SummaryRow
          icon={Clock3}
          label="Estimated pickup"
          value={
            selectedSlot
              ? `Executive arrives ${formatSlotSummary(selectedSlot).split(" · ")[0]}`
              : "After slot selection"
          }
        />
        <SummaryRow
          icon={FileText}
          label="Instructions"
          value={instructions.trim() || "None added"}
        />
      </div>

      {(itemCount > 0 || selectedServices.length > 0) && (
        <motion.div
          layout
          transition={transition}
          className="mt-6 space-y-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-secondary/10 p-4"
        >
          {itemCount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated items</span>
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-semibold"
                >
                  {itemCount}
                </motion.span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. weight</span>
                <span className="font-semibold">{weight.toFixed(1)} kg</span>
              </div>
            </>
          )}
          {selectedServices.length > 0 && (
            <div className="space-y-1 border-t border-primary/10 pt-3">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium">
                    {s.priceInr === 0 ? "Included" : `₹${s.priceInr}`}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-1 text-sm font-semibold">
                <span>Est. total</span>
                <span className="text-primary">₹{charges.grandTotal}</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#10B5B8]/15 via-primary/5 to-transparent p-4">
        <p className="text-sm font-medium text-foreground">Doorstep pickup care</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Our executive arrives in your selected window with tagged bags and real-time status
          updates.
        </p>
      </div>
    </aside>
  );
}
