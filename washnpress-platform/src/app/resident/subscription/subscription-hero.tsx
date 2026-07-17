"use client";

import { Crown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UsageProgress } from "./components/usage-progress";
import { useSubscription } from "./subscription-provider";

export function SubscriptionHero() {
  const { subscription } = useSubscription();
  if (!subscription) return null;

  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
        <Badge className="mb-5 bg-white/20 text-white border-white/20">
          Active Subscription
        </Badge>

        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8" />

          <h1 className="text-4xl font-bold">
            {subscription.name}
          </h1>
        </div>

        <p className="mt-6 text-5xl font-bold">
          ₹{subscription.monthlyPrice}

          <span className="text-xl font-normal">
            /month
          </span>
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Calendar className="h-5 w-5" />

          <span>
            Renews on {subscription.renewalDate}
          </span>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button variant="secondary">
            Upgrade Plan
          </Button>

          <Button
            variant="outline"
            className="border-white text-black hover:bg-white"
          >
            Manage Subscription
          </Button>
        </div>
      </div>

      <UsageProgress />
    </section>
  );
}