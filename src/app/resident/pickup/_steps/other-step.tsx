"use client";

import { motion } from "framer-motion";
import { usePickup } from "../hooks/use-pickup";
import { estimateWeightKg, totalGarmentCount } from "../_data/pickup-constants";
import { springSoft, staggerContainer, staggerItem } from "../_components/motion-primitives";
import { Check, Package, Shirt, Layers, BedDouble, Bath, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { GarmentOption } from "../_types/pickup.types";

const iconMap: Record<string, typeof Shirt> = {
  shirts: Shirt,
  trousers: Layers,
  dresses: Shirt,
  bedding: BedDouble,
  towels: Bath,
  others: Package,
};

export function OtherStep() {
  const { garments, setGarmentQty, garmentOptions } = usePickup();
  const totalItems = totalGarmentCount(garments);
  const weight = estimateWeightKg(garments, garmentOptions);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Add other clothes
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Include extra items like bedding, towels, and miscellaneous pieces to complete your pickup.
        </p>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-4">
        {garmentOptions.map((item) => {
          const qty = garments[item.id] ?? 0;
          const active = qty > 0;
          const Icon = iconMap[item.icon] ?? Shirt;

          return (
            <motion.div
              key={item.id}
              variants={staggerItem}
              className={cn(
                "rounded-[22px] border p-5 transition duration-300",
                active ? "border-primary bg-primary/5" : "border-border bg-card",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${item.name}`}
                    disabled={qty === 0}
                    onClick={() => setGarmentQty(item.id, qty - 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-lg font-semibold text-foreground">{qty}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${item.name}`}
                    onClick={() => setGarmentQty(item.id, qty + 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary bg-primary/10 text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-muted-foreground">Current pickup details</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs text-muted-foreground">Total items</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{totalItems}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs text-muted-foreground">Estimated weight</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{weight.toFixed(1)} kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
