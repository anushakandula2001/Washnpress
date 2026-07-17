"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  getRemainingGarments,
  getUsagePercentage,
} from "../subscription";
import { useSubscription } from "../subscription-provider";

interface UsageProgressProps {
  used?: number;
  total?: number;
  daysLeft?: number;
}

export function UsageProgress({ used, total, daysLeft }: UsageProgressProps) {
  const { subscription } = useSubscription();

  const usedGarments = used ?? subscription?.usedGarments ?? 0;
  const totalGarments = total ?? subscription?.totalGarments ?? 1;
  const days = daysLeft ?? subscription?.daysLeft ?? 0;
  const percentage = getUsagePercentage(usedGarments, totalGarments);
  const remaining = getRemainingGarments(usedGarments, totalGarments);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Monthly Usage
          </p>

          <h3 className="mt-1 text-3xl font-bold">
            {usedGarments}
            <span className="text-lg font-medium text-muted-foreground">
              {" "}
              / {totalGarments}
            </span>
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Garments used this billing cycle
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{percentage}% Used</span>

            <span className="font-medium">
              {remaining} Remaining
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(percentage, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Subscription Renewal
              </p>

              <p className="text-xs text-muted-foreground">
                {days} days remaining
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold">
                {days}
              </p>

              <p className="text-xs text-muted-foreground">
                Days Left
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}