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
  className?: string;
};

export function StepNavigation({
  step,
  canContinue,
  submitting = false,
  onBack,
  onNext,
  className,
}: StepNavigationProps) {
  if (step === "success") return null;

  const isFirst = step === "slot";
  const isReview = step === "review";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-sm backdrop-blur",
        "lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none",
        "fixed inset-x-0 bottom-0 z-30 border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:relative lg:inset-auto",
        className,
      )}
    >
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
  );
}
