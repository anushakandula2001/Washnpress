"use client";

import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionPlan } from "./subscription";
import { FeatureList } from "./components/feature-list";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onUpgrade?: () => void;
}

export function SubscriptionPlanCard({
  plan,
  onUpgrade,
}: SubscriptionPlanCardProps) {
  return (
    <Card
      className={`relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        plan.current
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : ""
      }`}
    >
      <CardContent className="p-6">
        {plan.current && (
          <Badge className="absolute right-4 top-4">
            {plan.badge}
          </Badge>
        )}

        <h2 className="text-2xl font-bold">
          {plan.name}
        </h2>

        <p className="mt-4 text-4xl font-bold">
          ₹{plan.price}

          <span className="text-base font-normal text-muted-foreground">
            /month
          </span>
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Garments
            </span>

            <span className="font-medium">
              {plan.garmentsPerMonth}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Turnaround
            </span>

            <span className="font-medium">
              {plan.turnaround}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Pickup
            </span>

            <span className="font-medium">
              {plan.pickup}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Support
            </span>

            <span className="font-medium">
              {plan.support}
            </span>
          </div>
        </div>

        <div className="my-6 border-t" />

        <FeatureList features={plan.features} />

        <Button
          className="mt-8 w-full"
          variant={plan.current ? "secondary" : "default"}
          onClick={onUpgrade}
          disabled={plan.current}
        >
          {plan.current ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Current Plan
            </>
          ) : (
            "Upgrade"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}