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
} from "lucide-react";
import { useResident } from "@/components/resident/resident-provider";
import {
  computeCharges,
  formatSlotSummary,
  totalGarmentCount,
} from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { staggerContainer, staggerItem } from "../_components/motion-primitives";

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
  const charges = computeCharges(selectedServiceIds, garments, garmentOptions, serviceOptions, taxRate, deliveryFee);
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
        className="space-y-4 md:space-y-6"
      >
        {/* Pickup Details Card */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl md:rounded-3xl border-2 border-border/50 bg-white p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <span className="flex h-10 md:h-12 w-10 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/15 text-primary">
              <MapPin className="h-5 md:h-6 w-5 md:w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base md:text-lg">Pickup Details</h3>
              {selectedSlot ? (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-semibold text-foreground">
                    📅 {formatReviewDate(selectedSlot.date)} · {formatSlotSummary(selectedSlot)}
                  </p>
                  <p className="text-muted-foreground">
                    📍 {profile?.society || "—"}, Flat {profile?.flatNumber || "—"}, {profile?.tower || "—"}
                  </p>
                  <p className="text-muted-foreground">
                    📞 +91 {profile?.mobile || "—"}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No slot selected</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Garments Card */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl md:rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/2 p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <span className="flex h-10 md:h-12 w-10 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/20 text-primary">
              <Shirt className="h-5 md:h-6 w-5 md:w-6" />
            </span>
            <div>
              <h3 className="font-bold text-base md:text-lg">Garments & Costs</h3>
              <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">Breakdown of your laundry items</p>
            </div>
          </div>

          {garmentLines.length > 0 ? (
            <div className="space-y-2 rounded-xl bg-white/70 p-3 md:p-4">
              {garmentLines.map((g) => {
                const qty = garments[g.id] ?? 0;
                const itemCost = qty * (g.washPriceInr ?? 0);
                return (
                  <motion.div
                    key={g.id}
                    variants={staggerItem}
                    className="flex items-center justify-between rounded-lg bg-white p-2.5 md:p-3 border border-border/40"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm md:text-base text-foreground">{g.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {qty} × ₹{g.washPriceInr ?? 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm md:text-base text-primary">
                        ₹{itemCost.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No garments selected</p>
          )}
        </motion.div>

        {/* Services Card */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl md:rounded-3xl border-2 border-border/50 bg-white p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <span className="flex h-10 md:h-12 w-10 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="h-5 md:h-6 w-5 md:w-6" />
            </span>
            <div>
              <h3 className="font-bold text-base md:text-lg">Services Selected</h3>
              <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">Additional laundry services</p>
            </div>
          </div>

          {services.length > 0 ? (
            <div className="space-y-2">
              {services.map((s) => (
                <motion.div
                  key={s.id}
                  variants={staggerItem}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 md:p-3 border border-border/30"
                >
                  <span className="text-sm md:text-base font-medium text-foreground">{s.name}</span>
                  <span className="font-bold text-sm md:text-base text-primary">
                    {s.priceInr === 0 ? "Included" : `₹${s.priceInr}`}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No additional services selected</p>
          )}
        </motion.div>

        {/* Instructions Card */}
        {instructions.trim() && (
          <motion.div
            variants={staggerItem}
            className="rounded-2xl md:rounded-3xl border-2 border-border/50 bg-white p-5 md:p-6 shadow-sm"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <span className="flex h-10 md:h-12 w-10 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/15 text-primary">
                <FileText className="h-5 md:h-6 w-5 md:w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base md:text-lg">Special Instructions</h3>
                <p className="mt-2 text-sm text-muted-foreground">{instructions}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Summary - Main Focus */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl md:rounded-3xl border-3 border-primary/60 bg-gradient-to-br from-primary/8 to-primary/4 p-5 md:p-6 shadow-md"
        >
          <h3 className="font-bold text-lg md:text-xl mb-5 flex items-center gap-2">
            <TicketPercent className="h-5 md:h-6 w-5 md:w-6 text-primary" />
            Price Breakdown
          </h3>

          <div className="space-y-3">
            {/* Garment Costs */}
            {charges.garmentCosts > 0 && (
              <div className="flex justify-between items-center p-3 md:p-4 rounded-lg bg-white border border-border/40">
                <span className="text-sm md:text-base font-medium text-foreground">
                  Garment Washing ({itemCount} item{itemCount !== 1 ? "s" : ""})
                </span>
                <span className="text-sm md:text-base font-bold text-primary">
                  ₹{charges.garmentCosts.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Service Costs */}
            {charges.services > 0 && (
              <div className="flex justify-between items-center p-3 md:p-4 rounded-lg bg-white border border-border/40">
                <span className="text-sm md:text-base font-medium text-foreground">
                  Additional Services ({services.length})
                </span>
                <span className="text-sm md:text-base font-bold text-primary">
                  ₹{charges.services.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Delivery Fee */}
            {charges.deliveryFee > 0 && (
              <div className="flex justify-between items-center p-3 md:p-4 rounded-lg bg-white border border-border/40">
                <span className="text-sm md:text-base font-medium text-foreground">Delivery Fee</span>
                <span className="text-sm md:text-base font-bold text-primary">
                  ₹{charges.deliveryFee.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="border-t-2 border-primary/20 pt-3">
              {/* Subtotal */}
              <div className="flex justify-between items-center p-3 md:p-4 mb-2">
                <span className="text-sm md:text-base font-semibold text-muted-foreground">Subtotal</span>
                <span className="text-sm md:text-base font-bold text-muted-foreground">
                  ₹{charges.subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center p-3 md:p-4 mb-3">
                <span className="text-sm md:text-base font-semibold text-muted-foreground">Tax (5%)</span>
                <span className="text-sm md:text-base font-bold text-muted-foreground">
                  ₹{charges.tax.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Grand Total - Highlighted */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-between items-center p-4 md:p-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white"
              >
                <span className="text-base md:text-lg font-bold">You will pay</span>
                <span className="text-2xl md:text-3xl font-extrabold">
                  ₹{charges.grandTotal.toLocaleString("en-IN")}
                </span>
              </motion.div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xs md:text-sm text-primary font-medium"
          >
            💡 Final charges may vary if garment quantities change after inspection.
          </motion.p>
        </motion.div>

        {/* Subscription Summary */}
        {subscription && (
          <motion.div
            variants={staggerItem}
            className="rounded-2xl md:rounded-3xl border-2 border-border/50 bg-white p-5 md:p-6 shadow-sm"
          >
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <span className="flex h-10 md:h-12 w-10 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/15 text-primary">
                <CalendarClock className="h-5 md:h-6 w-5 md:w-6" />
              </span>
              <div>
                <h3 className="font-bold text-base md:text-lg">Your Subscription</h3>
                <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">Active plan details</p>
              </div>
            </div>

            <div className="grid gap-3 md:gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-muted-foreground font-medium">Plan</p>
                <p className="mt-1 font-bold text-foreground">{subscription.planName}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-muted-foreground font-medium">Monthly Cost</p>
                <p className="mt-1 font-bold text-foreground">₹{subscription.monthlyInr}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-muted-foreground font-medium">Garments Used</p>
                <p className="mt-1 font-bold text-foreground">{subscription.garmentsUsed}/{subscription.garmentCap}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-muted-foreground font-medium">Renewal Date</p>
                <p className="mt-1 font-bold text-foreground">{subscription.renewsOn}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pickup Timeline */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl md:rounded-3xl border-2 border-border/50 bg-white p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <span className="flex h-10 md:h-12 w-10 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/15 text-primary">
              <Clock3 className="h-5 md:h-6 w-5 md:w-6" />
            </span>
            <div>
              <h3 className="font-bold text-base md:text-lg">What Happens Next</h3>
              <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">Your order journey</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 md:p-4 border border-primary/20">
              <p className="font-bold text-primary text-base md:text-lg">1.</p>
              <p className="mt-1 font-bold text-foreground">Pickup</p>
              <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">We'll arrive at your door</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 md:p-4 border border-border/30">
              <p className="font-bold text-muted-foreground text-base md:text-lg">2.</p>
              <p className="mt-1 font-bold text-foreground">Processing</p>
              <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">Professional care & cleaning</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 md:p-4 border border-border/30">
              <p className="font-bold text-muted-foreground text-base md:text-lg">3.</p>
              <p className="mt-1 font-bold text-foreground">Delivery</p>
              <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">Fresh & ready at home</p>
            </div>
          </div>
        </motion.div>

        {/* Important Info */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl md:rounded-3xl border-2 border-amber-200/50 bg-amber-50/30 p-5 md:p-6"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <span className="flex h-10 md:h-12 w-10 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-amber-100/50 text-amber-700">
              <Info className="h-5 md:h-6 w-5 md:w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base md:text-lg text-amber-900">Important Information</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-amber-900/80">
                <li>✓ Please keep garments ready before the pickup window.</li>
                <li>✓ Final charges may vary if quantities change after inspection.</li>
                <li>✓ All items are insured during processing and delivery.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
