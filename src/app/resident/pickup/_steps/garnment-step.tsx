"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Bath,
  Check,
  ChevronDown,
  Minus,
  Plus,
  Package,
  Shirt,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { estimateWeightKg, totalGarmentCount } from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { springSoft } from "../_components/motion-primitives";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  pants: Layers,
  dress: Shirt,
  bed: BedDouble,
  towel: Bath,
  package: Package,
};

const categories = [
  {
    id: "top-wear",
    title: "Top Wear",
    matcher: (name: string) => /shirt|t-shirt|polo|kurti|top/i.test(name),
  },
  {
    id: "bottom-wear",
    title: "Bottom Wear",
    matcher: (name: string) => /jeans|trouser|shorts|track|pants|chino/i.test(name),
  },
  {
    id: "traditional",
    title: "Traditional",
    matcher: (name: string) => /saree|kurta|sherwani|lehenga|dress/i.test(name),
  },
  {
    id: "winter-wear",
    title: "Winter Wear",
    matcher: (name: string) => /sweater|jacket|coat|hoodie/i.test(name),
  },
];

function parsePricing(description: string, item?: {
  washPriceInr?: number;
  ironPriceInr?: number;
  dryCleanPriceInr?: number;
}) {
  const washMatch = description.match(/wash\s*₹\s*(\d+)/i);
  const ironMatch = description.match(/iron\s*₹\s*(\d+)/i);
  const dryCleanMatch = description.match(/dry\s*clean\s*₹\s*(\d+)/i);
  return {
    wash: item?.washPriceInr ?? (washMatch ? Number(washMatch[1]) : null),
    iron: item?.ironPriceInr ?? (ironMatch ? Number(ironMatch[1]) : null),
    dryClean: item?.dryCleanPriceInr ?? (dryCleanMatch ? Number(dryCleanMatch[1]) : null),
  };
}

function formatPrice(value: number | null) {
  return value !== null ? `₹${value}` : "—";
}

export function GarmentStep() {
  const { garments, setGarmentQty, garmentOptions } = usePickup();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((category) => [category.id, true])),
  );

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return garmentOptions;
    return garmentOptions.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [garmentOptions, search]);

  const total = totalGarmentCount(garments);
  const estimatedTotal = useMemo(
    () =>
      garmentOptions.reduce((sum, item) => {
        const qty = garments[item.id] ?? 0;
        const pricing = parsePricing(item.description, item);
        return sum + qty * (pricing.wash ?? 0);
      }, 0),
    [garmentOptions, garments],
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-3 md:space-y-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            What are we picking up?
          </h2>
          <p className="mt-2 md:mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Select the garments you want to send for pickup. Choose quantities now and select services in the next step.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1.6fr)_340px] lg:items-start">
          <div className="space-y-3 md:space-y-4">
            {/* Search Bar */}
            <div className="sticky top-0 z-10 rounded-2xl md:rounded-3xl border border-border bg-white/95 backdrop-blur p-4 md:p-5 shadow-sm">
              <label className="block text-sm font-semibold text-foreground" htmlFor="garment-search">
                🔍 Search garments
              </label>
              <div className="mt-3 relative">
                <input
                  id="garment-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Find by name or type..."
                  className="w-full rounded-xl md:rounded-2xl border border-border bg-slate-50 py-2.5 md:py-3 px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3 md:space-y-4">
              {categories.map((category) => {
                const items = filteredOptions.filter((item) => category.matcher(item.name));
                if (items.length === 0) return null;
                
                const categorySelected = items.some((item) => (garments[item.id] ?? 0) > 0);

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-2xl md:rounded-[24px] border-2 bg-white overflow-hidden transition-all duration-200",
                      categorySelected
                        ? "border-primary/40 shadow-[0_4px_20px_-8px_rgba(14,165,233,0.3)]"
                        : "border-border hover:border-border/60 shadow-sm"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [category.id]: !prev[category.id] }))
                      }
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 text-left transition",
                        categorySelected ? "bg-primary/5" : "bg-slate-50/50 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-base md:text-lg font-bold text-foreground">{category.title}</p>
                        <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-muted-foreground font-medium">
                          {items.length} item{items.length === 1 ? "" : "s"}
                          {categorySelected && ` • ${items.reduce((sum, item) => sum + (garments[item.id] ?? 0), 0)} selected`}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: expanded[category.id] ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-primary font-bold" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded[category.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 md:space-y-4 px-4 md:px-6 py-4 md:py-5 border-t border-border/30">
                            {items.map((item) => {
                              const qty = garments[item.id] ?? 0;
                              const pricing = parsePricing(item.description, item);
                              const active = qty > 0;
                              const Icon = iconMap[item.icon] ?? Package;
                              const itemTotal = (pricing.wash ?? 0) * qty;

                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "relative overflow-hidden rounded-2xl border-2 p-4 md:p-5 transition-all duration-200",
                                    active
                                      ? "border-primary/50 bg-gradient-to-br from-primary/8 to-primary/5 shadow-[0_8px_24px_-12px_rgba(14,165,233,0.4)]"
                                      : "border-border/40 bg-white hover:border-primary/30 hover:shadow-sm"
                                  )}
                                >
                                  {/* Checkmark Badge */}
                                  {active && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute right-3 md:right-4 top-3 md:top-4 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg"
                                    >
                                      <Check className="h-4 md:h-5 w-4 md:w-5" />
                                    </motion.div>
                                  )}

                                  {/* Garment Info */}
                                  <div className="flex items-start gap-3 md:gap-4">
                                    <div className="flex h-12 md:h-14 w-12 md:w-14 flex-shrink-0 items-center justify-center rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                                      <Icon className="h-5 md:h-6 w-5 md:w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-base md:text-lg font-bold text-foreground">{item.name}</p>
                                      <p className="mt-1 text-xs md:text-sm text-muted-foreground/80">{item.description}</p>
                                      
                                      {/* Pricing Section */}
                                      <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-3">
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 md:px-3 py-1.5">
                                          <span className="text-xs font-bold text-primary">
                                            {formatPrice(pricing.wash)}/item
                                          </span>
                                        </div>
                                        {active && (
                                          <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-xs md:text-sm font-semibold text-foreground"
                                          >
                                            Total: <span className="text-primary font-bold">₹{itemTotal.toLocaleString("en-IN")}</span>
                                          </motion.div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="mt-4 md:mt-5 flex items-center justify-between rounded-2xl bg-slate-50/80 p-2 md:p-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                      Qty
                                    </span>
                                    <div className="flex items-center gap-2 md:gap-3">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        aria-label={`Decrease ${item.name}`}
                                        disabled={qty === 0}
                                        onClick={() => setGarmentQty(item.id, qty - 1)}
                                        className={cn(
                                          "flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-xl border-2 font-bold transition-all",
                                          qty === 0
                                            ? "border-border/30 bg-slate-100 text-muted-foreground/40 cursor-not-allowed"
                                            : "border-primary bg-white text-primary hover:bg-primary hover:text-white"
                                        )}
                                      >
                                        <Minus className="h-4 md:h-5 w-4 md:w-5" />
                                      </motion.button>

                                      <motion.div
                                        key={qty}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="min-w-[2.5rem] md:min-w-[3rem] text-center"
                                      >
                                        <span className="text-2xl md:text-3xl font-extrabold text-foreground tabular-nums">
                                          {qty}
                                        </span>
                                      </motion.div>

                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        aria-label={`Increase ${item.name}`}
                                        onClick={() => setGarmentQty(item.id, qty + 1)}
                                        className="flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-xl border-2 border-primary bg-primary text-white font-bold transition-all hover:bg-primary/90 shadow-md hover:shadow-lg"
                                      >
                                        <Plus className="h-4 md:h-5 w-4 md:w-5" />
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Live Summary - Sticky Sidebar */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl md:rounded-[28px] border-2 p-4 md:p-6 transition-all duration-200",
                total > 0
                  ? "border-primary/30 bg-gradient-to-br from-primary/8 to-primary/5 shadow-[0_8px_32px_-8px_rgba(14,165,233,0.3)]"
                  : "border-border/30 bg-white shadow-sm"
              )}
            >
              <div className="space-y-4 md:space-y-5">
                <div>
                  <p className="text-xs md:text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Order Summary
                  </p>
                </div>

                {/* Selected Items */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "rounded-2xl p-4 md:p-5 transition-all",
                    total > 0
                      ? "bg-white border-2 border-primary/40"
                      : "bg-slate-50/70 border border-border/30"
                  )}
                >
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">Selected Garments</p>
                  <motion.p
                    key={total}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "mt-2 text-3xl md:text-4xl font-extrabold tabular-nums",
                      total > 0 ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {total}
                  </motion.p>
                  <p className="mt-1 text-xs text-muted-foreground">{total === 1 ? "item" : "items"}</p>
                </motion.div>

                {/* Estimated Total */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "rounded-2xl p-4 md:p-5 transition-all",
                    estimatedTotal > 0
                      ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg"
                      : "bg-slate-50/70 border border-border/30"
                  )}
                >
                  <p className={cn(
                    "text-xs md:text-sm font-medium",
                    estimatedTotal > 0 ? "text-white/80" : "text-muted-foreground"
                  )}>
                    Estimated Total
                  </p>
                  <motion.p
                    key={estimatedTotal}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 text-3xl md:text-4xl font-extrabold tabular-nums"
                  >
                    ₹{estimatedTotal.toLocaleString("en-IN")}
                  </motion.p>
                </motion.div>

                {/* Info Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs md:text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="font-semibold text-foreground">💡 Tip:</span> Quantities update instantly. You'll select services like wash, iron & dry clean in the next step.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
