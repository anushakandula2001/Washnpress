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
    support: p.supportType,
    rollover: "—",
    current: p.isCurrent,
    isPopular: p.isPopular,
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

      {mapped.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No plans available</h3>
          <p className="text-slate-500">There are currently no subscription plans available. Please check back later.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {mapped.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              onUpgrade={plan.current ? undefined : () => upgradePlan(plan.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
