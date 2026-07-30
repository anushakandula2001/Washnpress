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
  Search,
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

function parsePricing(description: string) {
  const washMatch = description.match(/wash\s*₹\s*(\d+)/i);
  const ironMatch = description.match(/iron\s*₹\s*(\d+)/i);
  const dryCleanMatch = description.match(/dry\s*clean\s*₹\s*(\d+)/i);
  return {
    wash: washMatch ? Number(washMatch[1]) : null,
    iron: ironMatch ? Number(ironMatch[1]) : null,
    dryClean: dryCleanMatch ? Number(dryCleanMatch[1]) : null,
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
  const weight = estimateWeightKg(garments, garmentOptions);
  const estimatedTotal = useMemo(
    () =>
      garmentOptions.reduce((sum, item) => {
        const qty = garments[item.id] ?? 0;
        const pricing = parsePricing(item.description);
        return sum + qty * (pricing.wash ?? 0);
      }, 0),
    [garmentOptions, garments],
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            What are we picking up?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Select the garments you want to send for pickup. Choose quantities now and select services in the next step.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_320px] lg:items-start">
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
              <label className="block text-sm font-semibold text-foreground" htmlFor="garment-search">
                Search garments
              </label>
              <div className="mt-3 relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="garment-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="🔍 Search garments..."
                  className="w-full rounded-2xl border border-border bg-slate-50 py-3 pl-12 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => {
                const items = filteredOptions.filter((item) => category.matcher(item.name));
                return (
                  <div key={category.id} className="rounded-[20px] border border-border bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [category.id]: !prev[category.id] }))
                      }
                      className="flex w-full items-center justify-between gap-3 rounded-[20px] px-5 py-4 text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{category.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expanded[category.id] ? "rotate-180" : "rotate-0",
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded[category.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 px-5 pb-5">
                            {items.length === 0 ? (
                              <div className="rounded-3xl border border-dashed border-border/70 bg-slate-50 p-6 text-sm text-muted-foreground">
                                No garments match this category.
                              </div>
                            ) : (
                              items.map((item) => {
                                const qty = garments[item.id] ?? 0;
                                const pricing = parsePricing(item.description);
                                const active = qty > 0;
                                const Icon = iconMap[item.icon] ?? Package;

                                return (
                                  <div
                                    key={item.id}
                                    className={cn(
                                      "relative overflow-hidden rounded-[20px] border bg-white p-5 transition duration-300",
                                      active
                                        ? "border-primary/60 bg-sky-50 shadow-[0_18px_45px_-30px_rgba(14,165,233,0.8)]"
                                        : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
                                    )}
                                  >
                                    {active ? (
                                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
                                        <Check className="h-4 w-4" />
                                      </div>
                                    ) : null}

                                    <div className="flex items-start gap-4">
                                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
                                        <Icon className="h-6 w-6" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-base font-semibold text-foreground">{item.name}</p>
                                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                          <p>{item.description}</p>
                                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            <span>Wash {formatPrice(pricing.wash)}</span>
                                            {pricing.iron !== null && <span>Iron {formatPrice(pricing.iron)}</span>}
                                            {pricing.dryClean !== null && <span>Dry Clean {formatPrice(pricing.dryClean)}</span>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between">
                                      <button
                                        type="button"
                                        aria-label={`Decrease ${item.name}`}
                                        disabled={qty === 0}
                                        onClick={() => setGarmentQty(item.id, qty - 1)}
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <motion.span
                                        key={qty}
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="min-w-[3rem] text-center text-2xl font-semibold tabular-nums text-foreground"
                                      >
                                        {qty}
                                      </motion.span>
                                      <button
                                        type="button"
                                        aria-label={`Increase ${item.name}`}
                                        onClick={() => setGarmentQty(item.id, qty + 1)}
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Live summary
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-muted-foreground">Selected Garments</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{total} Items</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-muted-foreground">Estimated Total</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">₹{estimatedTotal.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">
                Quantities update instantly. Services will be selected in the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
