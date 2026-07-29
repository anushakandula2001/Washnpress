"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Bath,
  Check,
  ChevronDown,
  Layers,
  Minus,
  Plus,
  Package,
  Search,
  Shirt,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { estimateWeightKg, totalGarmentCount } from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { springSoft, staggerContainer, staggerItem } from "../_components/motion-primitives";

const iconMap = {
  shirt: Shirt,
  pants: Layers,
  dress: Shirt,
  bed: BedDouble,
  towel: Bath,
  package: Package,
};

const GARMENT_CATEGORIES = [
  {
    id: "top-wear",
    label: "Top Wear",
    items: ["shirts", "tshirts", "polo-shirts", "kurti"],
  },
  {
    id: "bottom-wear",
    label: "Bottom Wear",
    items: ["jeans", "trousers", "shorts", "track-pants"],
  },
  {
    id: "traditional",
    label: "Traditional",
    items: ["saree", "kurta", "sherwani", "lehenga", "dresses"],
  },
  {
    id: "winter-wear",
    label: "Winter Wear",
    items: ["sweater", "jacket", "coat", "hoodie"],
  },
  {
    id: "household",
    label: "Household",
    items: ["bedsheet", "blanket", "curtains", "pillow-cover", "bedding", "towels", "others"],
  },
];

function getCategoryId(itemId: string) {
  const category = GARMENT_CATEGORIES.find((category) => category.items.includes(itemId));
  return category?.id ?? "household";
}

export function GarmentStep() {
  const { garments, setGarmentQty, garmentOptions } = usePickup();
  const [search, setSearch] = useState("");

  const total = totalGarmentCount(garments);
  const weight = estimateWeightKg(garments, garmentOptions);

  const estimatedTotal = useMemo(
    () =>
      garmentOptions.reduce(
        (sum, item) => sum + (garments[item.id] ?? 0) * Number(item.priceInr ?? 0),
        0,
      ),
    [garments, garmentOptions],
  );

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return garmentOptions;
    return garmentOptions.filter((item) => item.name.toLowerCase().includes(query));
  }, [garmentOptions, search]);

  const categories = useMemo(() => {
    const groups = GARMENT_CATEGORIES.map((category) => ({
      ...category,
      options: filteredOptions.filter((item) => getCategoryId(item.id) === category.id),
    }));

    return groups.filter((group) => group.options.length > 0);
  }, [filteredOptions]);

  const [openCategories, setOpenCategories] = useState(
    Object.fromEntries(categories.map((category) => [category.id, true])),
  );

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4 rounded-[28px] border border-border/80 bg-card p-6 shadow-sm md:p-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Step 2 of 5 · Garments</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            What are we picking up?
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Select the garments you want to send for pickup. Choose quantities now and select services in the next step.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search garments..."
                className="pl-12"
                aria-label="Search garments"
              />
            </div>

            <div className="mt-4 rounded-[18px] border border-border/70 bg-white p-3 shadow-sm lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Selected Garments
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{total} Items</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Estimated Total
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">₹{estimatedTotal}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="hidden h-full max-w-[260px] rounded-[18px] border border-border/70 bg-white p-2.5 shadow-sm lg:block">
              <div className="flex items-center justify-between gap-2.5">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Selected Garments
                  </p>
                  <p className="mt-1 text-base font-semibold text-foreground">{total}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Live preview
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-border/80 bg-primary/5 p-2.5">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Estimated Total
                </p>
                <p className="mt-2 text-xl font-semibold text-foreground">₹{estimatedTotal}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  This updates automatically as you choose garment quantities.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="rounded-[24px] border border-border bg-white p-8 text-center text-sm text-muted-foreground">
            No garments match your search. Try a different keyword.
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const isOpen = openCategories[category.id] ?? true;

              return (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-[24px] border border-border/70 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{category.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.options.length} items
                      </p>
                    </div>
                    <div className={cn("transition-transform duration-300", isOpen && "rotate-180")}>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
                          {category.options.map((item) => {
                            const qty = garments[item.id] ?? 0;
                            const Icon = iconMap[item.icon] ?? Package;
                            const active = qty > 0;

                            return (
                              <motion.div
                                key={item.id}
                                layout
                                whileHover={{ y: -2 }}
                                transition={springSoft}
                                className={cn(
                                  "relative overflow-hidden rounded-[18px] border bg-white p-4 shadow-sm transition-all duration-300",
                                  active
                                    ? "border-primary/40 bg-primary/5 shadow-[0_14px_28px_-22px_rgba(16,181,184,0.65)]"
                                    : "border-border hover:border-primary/40 hover:shadow-md",
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl",
                                      active ? "bg-primary text-white" : "bg-primary/10 text-primary",
                                    )}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground">{item.name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                  <button
                                    type="button"
                                    aria-label={`Decrease ${item.name}`}
                                    disabled={qty === 0}
                                    onClick={() => setGarmentQty(item.id, qty - 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-white text-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>

                                  <div className="min-w-[2.25rem] text-center text-lg font-semibold text-foreground tabular-nums">
                                    {qty}
                                  </div>

                                  <button
                                    type="button"
                                    aria-label={`Increase ${item.name}`}
                                    onClick={() => setGarmentQty(item.id, qty + 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>

                                {active && (
                                  <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-sm">
                                    <Check className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
