"use client";

import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubscriptionEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border py-24 text-center">
      <PackageOpen className="h-16 w-16 text-muted-foreground" />

      <h2 className="mt-6 text-2xl font-bold">
        No Active Subscription
      </h2>

      <p className="mt-3 max-w-md text-muted-foreground">
        Subscribe to a WashNPress plan to enjoy free pickups,
        priority service, and monthly savings.
      </p>

      <Button className="mt-8">
        Browse Plans
      </Button>
    </div>
  );
}