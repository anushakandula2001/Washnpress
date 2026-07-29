"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  MapPin,
  Phone,
  Shirt,
  Sparkles,
  FileText,
  TicketPercent,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useResident } from "@/components/resident/resident-provider";
import {
  computeCharges,
  formatSlotDate,
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
      className="border-t border-border pt-5 first:border-t-0 first:pt-0"
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
    allocations,
  } = usePickup();
  const { profile } = useResident();

  const garmentLines = garmentOptions.filter((g) => (garments[g.id] ?? 0) > 0);
  const services = serviceOptions.filter((s) => selectedServiceIds.includes(s.id));
  const charges = computeCharges(selectedServiceIds, serviceOptions, taxRate, deliveryFee, garments, garmentOptions);
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
        className="grid gap-4"
      >
        <Section icon={Clock3} title="Pickup slot">
          {selectedSlot ? (
            <div>
              <p className="font-medium">{formatSlotDate(selectedSlot.date)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatSlotSummary(selectedSlot)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No slot selected</p>
          )}
        </Section>

        <Section icon={Shirt} title="Garments">
          <div className="space-y-4">
            {garmentLines.map((g) => {
              const allocs = allocations?.[g.id] ?? [];
              const garmentTotal = allocs.reduce((s, a) => s + (a.qty ?? 0) * (serviceOptions.find((x) => x.id === a.serviceId)?.priceInr ?? 0), 0);
              return (
                <div key={g.id} className="rounded-md border border-border/50 p-3">
                  <p className="font-medium">{g.name}</p>
                  <div className="mt-2 space-y-2">
                    {allocs.map((a) => {
                      const svc = serviceOptions.find((s) => s.id === a.serviceId);
                      if (!svc) return null;
                      return (
                        <div key={a.serviceId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{svc.name}</span>
                          <span className="font-semibold">{a.qty} × ₹{svc.priceInr} = ₹{a.qty * svc.priceInr}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-semibold">₹{garmentTotal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm font-medium text-primary">
            {itemCount} item{itemCount === 1 ? "" : "s"} total
          </p>
        </Section>

        <Section icon={Sparkles} title="Services">
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
        </Section>

        <Section icon={MapPin} title="Address">
          <p className="text-sm font-medium">{profile?.society || "—"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Flat {profile?.flatNumber || "—"}, {profile?.tower || "—"}
          </p>
        </Section>

        <Section icon={Phone} title="Phone">
          <p className="text-sm font-medium">+91 {profile?.mobile || "—"}</p>
        </Section>

        <Section icon={FileText} title="Instructions">
          <p className="text-sm text-muted-foreground">
            {instructions.trim() || "No special instructions"}
          </p>
        </Section>

        <Section icon={TicketPercent} title="Charges">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Coupon</span>
              <Input
                disabled
                placeholder="Coming soon"
                className="h-9 max-w-[180px] rounded-xl bg-muted/50"
              />
            </div>
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
      </motion.div>
    </div>
  );
}
