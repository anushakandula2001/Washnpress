"use client";

import { motion } from "framer-motion";
import { Check, Minus, Plus, Shirt, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MAX_INSTRUCTIONS } from "../_data/pickup-constants";
import { usePickup } from "../hooks/use-pickup";
import { springSoft, staggerContainer, staggerItem } from "../_components/motion-primitives";

function supportsServiceForGarment(garmentId: string, serviceName: string) {
  const id = garmentId.toLowerCase();
  const name = serviceName.toLowerCase();
  const isShoe = id.includes("shoe") || id.includes("shoes");
  const isCurtain = id.includes("curtain") || id.includes("curtains");
  const isBedding = id.includes("bed") || id.includes("blanket") || id.includes("bedding") || id.includes("towel");

  if (name.includes("shoe")) return isShoe;
  if (name.includes("curtain")) return isCurtain;
  if (name.includes("dry")) return !isShoe; // dry-clean supported for most non-shoe items
  if (name.includes("iron") || name.includes("press")) return !isBedding && !isShoe; // ironing for clothing
  if (name.includes("wash") || name.includes("fold")) return true; // wash applies broadly
  return true;
}

export function AddonsStep() {
  const {
    garments,
    garmentOptions,
    serviceOptions,
    allocations,
    setAllocationQty,
    instructions,
    setInstructions,
  } = usePickup();

  const selectedGarments = garmentOptions.filter((g) => (garments[g.id] ?? 0) > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Allocate services for your garments
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
          Assign services to each garment. You can split quantities across services.
        </p>
      </div>

      <div className="space-y-4">
        {selectedGarments.map((g) => {
          const total = garments[g.id] ?? 0;
          const alloc = allocations?.[g.id] ?? [];
          const allocatedTotal = alloc.reduce((s, a) => s + (a.qty ?? 0), 0);
          const remaining = Math.max(0, total - allocatedTotal);
          const supported = serviceOptions.filter((s) => supportsServiceForGarment(g.id, s.name));

          const garmentTotalCost = alloc.reduce((sum, a) => {
            const svc = serviceOptions.find((s) => s.id === a.serviceId);
            return sum + (a.qty ?? 0) * (svc?.priceInr ?? 0);
          }, 0);

          return (
            <div key={g.id} className="rounded-[16px] border border-border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                    <Shirt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">Selected: {total}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Remaining</p>
                  <p className={cn("font-bold mt-1", remaining === 0 ? "text-green-600" : "text-amber-600")}>{remaining === 0 ? `${remaining} ✓` : remaining}</p>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {supported.map((svc) => {
                  const rowAlloc = alloc.find((a) => a.serviceId === svc.id)?.qty ?? 0;
                  const maxAdd = total - allocatedTotal + rowAlloc; // allow increasing up to total

                  return (
                    <div key={svc.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition hover:shadow-md">
                      <div>
                        <p className="font-medium">{svc.name}</p>
                        <p className="text-xs text-muted-foreground">{svc.priceInr === 0 ? "Included" : `₹${svc.priceInr}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease ${svc.name}`}
                          onClick={() => setAllocationQty(g.id, svc.id, Math.max(0, rowAlloc - 1))}
                          className="h-9 w-9 rounded-md border bg-white flex items-center justify-center disabled:opacity-40"
                          disabled={rowAlloc <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="min-w-[2rem] text-center font-semibold">{rowAlloc}</div>
                        <button
                          type="button"
                          aria-label={`Increase ${svc.name}`}
                          onClick={() => setAllocationQty(g.id, svc.id, Math.min(maxAdd, rowAlloc + 1))}
                          className="h-9 w-9 rounded-md border bg-white flex items-center justify-center"
                          disabled={rowAlloc >= maxAdd}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <div className="ml-4 text-sm font-medium">₹{(rowAlloc * svc.priceInr).toFixed(0)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Estimated Cost</div>
                <div className="text-lg font-semibold">₹{garmentTotalCost}</div>
              </div>
            </div>
          );
        })}
      </div>

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
