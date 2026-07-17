"use client";

import { BenefitCard } from "./components/benefit-card";
import { subscriptionBenefits } from "./subscription";

export function SubscriptionBenefits() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          Premium Benefits
        </h2>

        <p className="text-muted-foreground">
          Enjoy exclusive advantages with your WashNPress subscription.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {subscriptionBenefits.map((benefit) => (
          <BenefitCard
            key={benefit.id}
            title={benefit.title}
            description={benefit.description}
            icon={benefit.icon}
          />
        ))}
      </div>
    </section>
  );
}