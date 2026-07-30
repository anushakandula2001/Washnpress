"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import { Check, Shirt, Sparkles, Anvil, Wind } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePickup } from "../hooks/use-pickup";
import { springSoft, staggerContainer, staggerItem } from "../_components/motion-primitives";
import { PRIMARY_LAUNDRY_TYPES } from "../_data/pickup-constants";

const iconMap: Record<string, typeof Shirt> = {
  "wash-fold": Shirt,
  "wash-iron": Anvil,
  "dry-cleaning": Sparkles,
  "steam-iron": Wind,
};

export function LaundryStep() {
  const { selectedServiceIds, setPrimaryService, serviceOptions } = usePickup();
  const primaryOptions = serviceOptions.filter((option) =>
    PRIMARY_LAUNDRY_TYPES.includes(option.id as typeof PRIMARY_LAUNDRY_TYPES[number]),
  );
  const currentPrimary = selectedServiceIds.find((id) =>
    PRIMARY_LAUNDRY_TYPES.includes(id as typeof PRIMARY_LAUNDRY_TYPES[number]),
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Choose your laundry type
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Start with the core care package that matches your clothes. You can add specialized services later.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        {primaryOptions.map((option) => {
          const active = option.id === currentPrimary;
          const Icon = iconMap[option.id] ?? Shirt;

          return (
            <motion.button
              key={option.id}
              type="button"
              variants={staggerItem}
              onClick={() => setPrimaryService(option.id)}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={springSoft}
              className={cn(
                "relative overflow-hidden rounded-[22px] border p-5 text-left transition duration-300",
                active
                  ? "border-primary bg-primary/5 shadow-[0_18px_45px_-30px_rgba(16,181,184,0.8)]"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                {active ? (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <div className="mt-5">
                <p className="text-base font-semibold text-foreground">{option.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.description}</p>
              </div>
              <p className="mt-4 text-sm font-semibold text-primary">
                {option.priceInr === 0 ? "Standard" : `₹${option.priceInr} per item`}
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
