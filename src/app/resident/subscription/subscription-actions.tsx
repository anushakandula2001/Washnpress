"use client";

import { Button } from "@/components/ui/button";
import { useSubscription } from "./subscription-provider";

export function SubscriptionActions() {
  const { pauseSubscription, cancelSubscription } = useSubscription();

  return (
    <section className="rounded-3xl border p-8">
      <h2 className="text-2xl font-bold">Manage Subscription</h2>
      <p className="mt-2 text-muted-foreground">
        Upgrade, pause or cancel your subscription whenever you need.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Button variant="outline" onClick={() => pauseSubscription()}>
          Pause Subscription
        </Button>

        <Button
          variant="outline"
          className="border-red-500 text-red-600 hover:bg-red-50"
          onClick={() => cancelSubscription()}
        >
          Cancel Subscription
        </Button>
      </div>
    </section>
  );
}
