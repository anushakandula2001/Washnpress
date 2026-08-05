"use client";

import React from "react";
import { Shirt, Sparkles, Package } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PreviewData = {
  garmentName?: string;
  garmentIcon?: React.ReactNode;
  garmentPriceInr?: number;
  garmentCategory?: string;
  selectedAddons?: Array<{
    name: string;
    priceInr: number;
    icon?: React.ReactNode;
  }>;
  subtotalInr?: number;
  deliveryChargeInr?: number;
  deliveryChargeLabel?: string;
  taxAmountInr?: number;
  taxLabel?: string;
  discountInr?: number;
  discountLabel?: string;
  grandTotalInr?: number;
};

export function BusinessPreviewCard({
  data,
  className,
}: {
  data: PreviewData;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-[22px] border border-border/80 bg-card p-6 shadow-[0_12px_40px_-24px_rgba(20,184,166,0.45)] w-full",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#14B8A6]">
            Resident Preview
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold">Live Order Total</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6]/20 to-blue-500/10 text-[#14B8A6]">
          <Package className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Selected Garment */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Selected Garment
          </p>
          <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                {data.garmentIcon || <Shirt className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-bold text-sm">{data.garmentName || "Men's Suit"}</p>
                <p className="text-[10px] text-muted-foreground">{data.garmentCategory || "Dry Clean"}</p>
              </div>
            </div>
            <span className="font-bold text-sm">
              ₹{(data.garmentPriceInr || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Selected Add-ons */}
        {data.selectedAddons && data.selectedAddons.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Selected Add-ons
            </p>
            <div className="space-y-2 bg-muted/30 border border-border/50 rounded-lg p-3">
              {data.selectedAddons.map((addon, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {addon.icon || <Sparkles className="h-3 w-3 text-purple-500" />}
                    <span className="text-xs font-medium">{addon.name}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    + ₹{addon.priceInr.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fees & Taxes */}
        <div className="pt-2 border-t border-border/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Order Summary
          </p>
          <div className="space-y-2 bg-gradient-to-br from-[#14B8A6]/5 to-transparent border border-border/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-xs font-medium">₹{(data.subtotalInr || 0).toFixed(2)}</span>
            </div>
            {data.deliveryChargeInr !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{data.deliveryChargeLabel || "Delivery Charge"}</span>
                <span className="text-xs font-medium text-[#14B8A6]">
                  + ₹{data.deliveryChargeInr.toFixed(2)}
                </span>
              </div>
            )}
            {data.taxAmountInr !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{data.taxLabel || "Taxes"}</span>
                <span className="text-xs font-medium">+ ₹{data.taxAmountInr.toFixed(2)}</span>
              </div>
            )}
            {data.discountInr !== undefined && data.discountInr > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#14B8A6]">{data.discountLabel || "Discount"}</span>
                <span className="text-xs font-medium text-[#14B8A6]">
                  - ₹{data.discountInr.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Grand Total */}
        <div className="border-t border-dashed border-border pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-bold">Grand Total</span>
            <span className="font-display font-bold text-2xl text-[#14B8A6]">
              ₹{(data.grandTotalInr || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Informational Message */}
        <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#10B5B8]/15 via-[#14B8A6]/5 to-transparent p-4">
          <p className="text-sm font-medium text-foreground">Live Calculation</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This card simulates exactly what a resident sees on the checkout screen based on your active pricing.
          </p>
        </div>
      </div>
    </aside>
  );
}
