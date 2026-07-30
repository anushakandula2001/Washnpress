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
  selectedItemsCount?: number;
  estimatedTotal?: number;
  className?: string;
};

export function StepNavigation({
  step,
  canContinue,
  submitting = false,
  onBack,
  onNext,
  selectedItemsCount,
  estimatedTotal,
  className,
}: StepNavigationProps) {
  if (step === "success") return null;

  const isFirst = step === "date";
  const isReview = step === "review";

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 p-4 shadow-sm backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 rounded-xl transition-all duration-300",
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
            className="h-11 min-w-[148px] rounded-xl bg-gradient-to-r from-primary to-[#10B5B8] px-6 shadow-md shadow-primary/25"
            disabled={!canContinue}
            loading={submitting}
            loadingText="Confirming…"
            onClick={onNext}
          >
            {isReview ? (
              "Confirm Pickup"
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
