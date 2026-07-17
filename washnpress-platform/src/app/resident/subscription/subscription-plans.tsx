"use client";

import { SubscriptionPlanCard } from "./subscription-plan-card";
import { useSubscription } from "./subscription-provider";
import type { SubscriptionPlan } from "./subscription";

export function SubscriptionPlans() {
  const { plans, upgradePlan } = useSubscription();

  const mapped: SubscriptionPlan[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.monthlyInr,
    garmentsPerMonth: p.garmentCap,
    turnaround: `${p.turnaroundHours}h`,
    pickup: "Free",
    support: p.features.includes("Priority Support") ? "Priority" : "Standard",
    rollover: "—",
    current: p.isCurrent,
    badge: p.isCurrent ? "Current Plan" : undefined,
    features: p.features,
  }));

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Upgrade or switch your laundry subscription anytime.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {mapped.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            onUpgrade={plan.current ? undefined : () => upgradePlan(plan.id)}
          />
        ))}
      </div>
    </section>
  );
}
