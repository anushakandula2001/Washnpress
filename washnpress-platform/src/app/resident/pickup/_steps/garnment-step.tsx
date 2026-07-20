"use client";

import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shirt, Minus, Plus, Package, BedDouble, Bath, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { estimateWeightKg, totalGarmentCount } from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { springSoft, staggerContainer, staggerItem } from "../_components/motion-primitives";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  pants: Layers,
  dress: Shirt,
  bed: BedDouble,
  towel: Bath,
  package: Package,
};

export function GarmentStep() {
  const { garments, setGarmentQty, garmentOptions } = usePickup();
  const total = totalGarmentCount(garments);
  const weight = estimateWeightKg(garments, garmentOptions);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          What are we picking up?
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
          Prices are managed by Admin. Add approximate quantities for this pickup.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        {garmentOptions.map((item) => {
          const qty = garments[item.id] ?? 0;
          const Icon = iconMap[item.icon] ?? Package;
          const active = qty > 0;

          return (
            <motion.div
              key={item.id}
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={springSoft}
              className={cn(
                "rounded-[22px] border bg-card p-5 shadow-sm transition-colors duration-300",
                active
                  ? "border-primary shadow-[0_14px_36px_-22px_rgba(16,181,184,0.7)]"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                    active
                      ? "bg-gradient-to-br from-primary to-[#10B5B8] text-white"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  aria-label={`Decrease ${item.name}`}
                  disabled={qty === 0}
                  onClick={() => setGarmentQty(item.id, qty - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary hover:text-primary disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={qty}
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-[2.5rem] text-center text-2xl font-bold tabular-nums text-foreground"
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>

                <button
                  type="button"
                  aria-label={`Increase ${item.name}`}
                  onClick={() => setGarmentQty(item.id, qty + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Estimated total items
          </p>
          <motion.p
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-2xl font-bold text-primary"
          >
            {total}
          </motion.p>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/10 to-transparent p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Estimated laundry weight
          </p>
          <motion.p
            key={weight.toFixed(1)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-2xl font-bold text-foreground"
          >
            {weight.toFixed(1)} kg
          </motion.p>
        </div>
      </div>
    </div>
  );
}
