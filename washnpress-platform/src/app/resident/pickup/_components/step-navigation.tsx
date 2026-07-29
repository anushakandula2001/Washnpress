"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { PickupStepId } from "../_types/pickup.types";
import { RippleButton } from "./ripple-button";

type StepNavigationProps = {
  step: PickupStepId;
  canContinue: boolean;
  submitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  selectedItems?: number;
  estimatedTotal?: number;
  fixed?: boolean;
  className?: string;
};

export function StepNavigation({
  step,
  canContinue,
  submitting = false,
  onBack,
  onNext,
  selectedItems = 0,
  estimatedTotal = 0,
  fixed = true,
  className,
}: StepNavigationProps) {
  if (step === "success") return null;

  const isFirst = step === "slot";
  const isReview = step === "review";
  const isFinalStep = step === "review";
  const showGarmentSummary = step === "garments" || step === "addons";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm",
        fixed ? "fixed inset-x-0 bottom-0 z-30 border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3" : "relative px-4 pb-6 pt-6",
        "lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between")}> 
        <div className="min-w-0 space-y-2">
          {showGarmentSummary ? (
            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
              <span className="font-semibold text-foreground">{selectedItems} Garments</span>
              <span className="font-semibold text-foreground">Estimated total ₹{estimatedTotal}</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {isReview ? "Review your booking before confirmation." : "Continue through the pickup flow."}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 w-full rounded-xl text-center transition-all duration-300 sm:w-auto",
              isFirst && "invisible pointer-events-none",
            )}
            onClick={onBack}
            disabled={submitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <RippleButton
            type="button"
            size="lg"
            className="h-11 w-full min-w-[148px] rounded-xl bg-gradient-to-r from-primary to-[#10B5B8] px-6 shadow-md shadow-primary/25 sm:w-auto"
            disabled={!canContinue}
            loading={submitting}
            loadingText="Confirming…"
            onClick={onNext}
          >
            {isFinalStep ? (
              "Confirm Pickup"
            ) : (
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                Continue
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
