"use client";

import { CheckCircle2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Basic", price: "₹1499/month" },
  { name: "Standard", price: "₹2199/month" },
  { name: "Premium", price: "₹2999/month" },
  { name: "Family", price: "₹4599/month" },
];

export function SubscriptionEmpty() {
  return (
    <div className="rounded-3xl border border-border bg-background p-8 shadow-sm sm:p-10">
      <div className="flex flex-col items-center text-center">
        <PackageOpen className="h-16 w-16 text-primary" />

        <h2 className="mt-6 text-3xl font-bold text-foreground">No Active Subscription</h2>
        <p className="mt-3 text-sm text-muted-foreground">Your subscription has been cancelled.</p>
      </div>

      <div className="mt-8 rounded-2xl bg-muted/50 p-6">
        <p className="text-sm font-medium text-foreground">Subscribe to continue enjoying:</p>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          {[
            "Scheduled laundry pickup",
            "Faster turnaround",
            "Discounted pricing",
            "Priority support",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Button className="w-full sm:w-auto">Choose a Plan</Button>
        <span className="text-sm text-muted-foreground">Available Plans</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl border border-border/70 bg-background p-4 text-center">
            <p className="text-sm font-semibold text-foreground">{plan.name}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{plan.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
