"use client";

import type { ComponentType } from "react";
import {
  Truck,
  Droplets,
  Shirt,
  CheckCircle2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { OrderStage } from "@/lib/resident-data";
import { getStageIndex } from "@/lib/resident-data";

const stageIcons: Record<OrderStage, ComponentType<{ className?: string }>> = {
  Pickup: Truck,
  Wash: Droplets,
  Ironing: Shirt,
  QC: CheckCircle2,
  Delivery: Package,
};

export function OrderHorizontalStepper({
  stages,
  currentStage,
  compact = false,
}: {
  stages: OrderStage[];
  currentStage: OrderStage;
  compact?: boolean;
}) {
  const currentIdx = getStageIndex(currentStage, stages);

  return (
    <div className={cn("flex items-center", compact ? "gap-0" : "gap-1")}>
      {stages.map((stage, idx) => {
        const Icon = stageIcons[stage];
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isPending = idx > currentIdx;

        return (
          <div key={stage} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-colors",
                  compact ? "h-6 w-6" : "h-8 w-8",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary/10 text-primary",
                  isPending && "border-border bg-muted text-muted-foreground",
                )}
              >
                <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              </div>
              {!compact && (
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive || isCompleted ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {stage}
                </span>
              )}
            </div>
            {idx < stages.length - 1 && (
              <div
                className={cn(
                  "mx-0.5 h-0.5 flex-1",
                  idx < currentIdx ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
