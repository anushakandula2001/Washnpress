"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  MapPin,
  Shirt,
  Sparkles,
  FileText,
  TicketPercent,
  CalendarClock,
  Info,
  PackageCheck,
} from "lucide-react";
import { useResident } from "@/components/resident/resident-provider";
import {
  computeCharges,
  formatSlotSummary,
  totalGarmentCount,
} from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { staggerContainer, staggerItem } from "../_components/motion-primitives";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Clock3;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      variants={staggerItem}
      className="border-b border-border/70 py-5 first:pt-0 last:border-b-0 last:pb-0"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}

function formatReviewDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year.slice(-2)}`;
}

export function SummaryStep() {
  const {
    selectedSlot,
    garments,
    selectedServiceIds,
    instructions,
    garmentOptions,
    serviceOptions,
    taxRate,
    deliveryFee,
  } = usePickup();
  const { profile, subscription } = useResident();

  const garmentLines = garmentOptions.filter((g) => (garments[g.id] ?? 0) > 0);
  const services = serviceOptions.filter((s) => selectedServiceIds.includes(s.id));
  const charges = computeCharges(selectedServiceIds, serviceOptions, taxRate, deliveryFee);
  const itemCount = totalGarmentCount(garments);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Review your booking
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
          Confirm the details below. You can go back anytime to adjust.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="rounded-[24px] border border-border/80 bg-card p-5 shadow-sm md:p-7"
      >
        <Section icon={MapPin} title="Pickup Details">
          {selectedSlot ? (
            <div>
              <p className="font-medium">
                {formatReviewDate(selectedSlot.date)} · {formatSlotSummary(selectedSlot)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile?.society || "—"}, Flat {profile?.flatNumber || "—"}, {profile?.tower || "—"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Contact: +91 {profile?.mobile || "—"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No slot selected</p>
          )}
        </Section>

        <Section icon={Shirt} title="Garments Summary">
          {garmentLines.length > 0 ? (
            <ul className="space-y-2">
              {garmentLines.map((g) => (
                <li key={g.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{g.name}</span>
                  <span className="font-semibold">× {garments[g.id]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No garments selected</p>
          )}
          <p className="mt-3 text-sm font-medium text-primary">
            {itemCount} item{itemCount === 1 ? "" : "s"} total
          </p>
        </Section>

        <Section icon={Sparkles} title="Add-on Services Summary">
          {services.length > 0 ? (
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-semibold">
                    {s.priceInr === 0 ? "Included" : `₹${s.priceInr}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No add-on services selected</p>
          )}
        </Section>

        <Section icon={FileText} title="Instructions">
          <p className="text-sm text-muted-foreground">
            {instructions.trim() || "No special instructions"}
          </p>
        </Section>

        <Section icon={TicketPercent} title="Estimated Charges">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Services</span>
              <span>₹{charges.services}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes (5%)</span>
              <span>₹{charges.tax}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Grand total</span>
              <span className="text-primary">₹{charges.grandTotal}</span>
            </div>
          </div>
        </Section>

        <Section icon={CalendarClock} title="Subscription Summary">
          {subscription ? (
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">Plan:</span> {subscription.planName}</p>
              <p><span className="text-muted-foreground">Monthly:</span> ₹{subscription.monthlyInr}</p>
              <p><span className="text-muted-foreground">Garments:</span> {subscription.garmentsUsed}/{subscription.garmentCap}</p>
              <p><span className="text-muted-foreground">Renews:</span> {subscription.renewsOn}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active subscription</p>
          )}
        </Section>

        <Section icon={Clock3} title="Pickup Timeline">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div><p className="font-medium text-primary">1. Pickup</p><p className="text-muted-foreground">Scheduled</p></div>
            <div><p className="font-medium">2. Processing</p><p className="text-muted-foreground">After collection</p></div>
            <div><p className="font-medium">3. Delivery</p><p className="text-muted-foreground">At your doorstep</p></div>
          </div>
        </Section>

        <Section icon={Info} title="Important Information">
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Please keep garments ready before the selected pickup window.</li>
            <li>Final charges may vary if garment quantities change after inspection.</li>
          </ul>
        </Section>

        <Section icon={PackageCheck} title="Order Summary">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{itemCount} garments · {services.length} service{services.length === 1 ? "" : "s"}</span>
            <span className="text-lg font-bold text-primary">₹{charges.grandTotal}</span>
          </div>
        </Section>
      </motion.div>
    </div>
  );
}
