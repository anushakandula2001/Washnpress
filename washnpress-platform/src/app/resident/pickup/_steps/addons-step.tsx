"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
  Shirt,
  Zap,
  Footprints,
  Check,
  Wind,
  Sparkles,
  Anvil,
  Blinds,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MAX_INSTRUCTIONS } from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { springSoft, staggerContainer, staggerItem } from "../_components/motion-primitives";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  fold: Shirt,
  iron: Anvil,
  shirt: Shirt,
  steam: Wind,
  zap: Zap,
  footprints: Footprints,
  curtains: Blinds,
  sparkles: Sparkles,
  truck: Zap,
};

export function AddonsStep() {
  const { selectedServiceIds, toggleService, instructions, setInstructions, serviceOptions } =
    usePickup();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Additional services
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
          Add-ons are configured by Admin and priced live from PostgreSQL.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        {serviceOptions.map((service) => {
          const selected = selectedServiceIds.includes(service.id);
          const Icon = iconMap[service.icon] ?? Sparkles;

          return (
            <motion.button
              key={service.id}
              type="button"
              variants={staggerItem}
              onClick={() => toggleService(service.id)}
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              animate={selected ? { scale: 1.02 } : { scale: 1 }}
              transition={springSoft}
              className={cn(
                "relative rounded-[22px] border p-5 text-left transition-colors duration-300",
                selected
                  ? "border-primary bg-primary/5 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent),0_16px_40px_-24px_rgba(16,181,184,0.85)]"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    selected
                      ? "bg-gradient-to-br from-primary to-[#10B5B8] text-white"
                      : "bg-muted text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <motion.span
                  initial={false}
                  animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
                  transition={springSoft}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </motion.span>
              </div>
              <p className="mt-4 font-semibold">{service.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
              <p className="mt-3 text-sm font-bold text-primary">
                {service.priceInr === 0 ? "Included" : `₹${service.priceInr}`}
              </p>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="relative rounded-[22px] border border-border bg-card p-5 shadow-sm md:p-6">
        <label htmlFor="pickup-instructions" className="sr-only">
          Special instructions
        </label>
        <span className="pointer-events-none absolute left-5 top-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary md:left-6">
          Instructions
        </span>
        <textarea
          id="pickup-instructions"
          value={instructions}
          maxLength={MAX_INSTRUCTIONS}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Gate code, preferred bag location, fabric notes…"
          className={cn(
            "mt-5 min-h-[120px] w-full resize-none rounded-2xl border border-transparent bg-muted/40 px-4 py-3 text-sm outline-none transition duration-300",
            "placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]",
          )}
        />
        <div className="mt-2 flex justify-end text-xs text-muted-foreground">
          {instructions.length}/{MAX_INSTRUCTIONS}
        </div>
      </div>
    </div>
  );
}
