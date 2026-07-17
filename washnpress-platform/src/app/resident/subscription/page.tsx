"use client";

import { ResidentShell } from "@/components/resident/resident-shell";
import { SubscriptionProvider, useSubscription } from "./subscription-provider";
import { SubscriptionHero } from "./subscription-hero";
import { SubscriptionStats } from "./subscription-stats";
import { SubscriptionPlans } from "./subscription-plans";
import { SubscriptionPayment } from "./subscription-payment";
import { SubscriptionBilling } from "./subscription-billing";
import { SubscriptionBenefits } from "./subscription-benefits";
import { SubscriptionBanner } from "./subscription-banner";
import { SubscriptionActions } from "./subscription-actions";
import { SubscriptionEmpty } from "./subscription-empty";
import { SubscriptionLoading } from "./subscription-loading";

function SubscriptionContent() {
  const { loading, error, subscription } = useSubscription();

  if (loading) return <SubscriptionLoading />;
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!subscription) return <SubscriptionEmpty />;

  return (
    <div className="space-y-10">
      <SubscriptionHero />
      <SubscriptionStats />
      <SubscriptionPlans />
      <div className="grid gap-6 lg:grid-cols-2">
        <SubscriptionPayment />
        <SubscriptionBilling />
      </div>
      <SubscriptionBenefits />
      <SubscriptionBanner />
      <SubscriptionActions />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <ResidentShell
      greeting="Subscription"
      subtitle="Manage your WashNPress subscription, billing, payment methods and premium benefits."
    >
      <SubscriptionProvider>
        <SubscriptionContent />
      </SubscriptionProvider>
    </ResidentShell>
  );
}
