"use client";

import { Lock, RefreshCcw, ShieldCheck } from "lucide-react";

export function SubscriptionBanner() {
  return (
    <section className="rounded-3xl border bg-gradient-to-r from-primary/5 to-primary/10 p-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4">
          <Lock className="h-10 w-10 text-primary" />

          <div>
            <h3 className="font-semibold">
              Secure Payments
            </h3>

            <p className="text-sm text-muted-foreground">
              Encrypted payment processing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <RefreshCcw className="h-10 w-10 text-primary" />

          <div>
            <h3 className="font-semibold">
              Cancel Anytime
            </h3>

            <p className="text-sm text-muted-foreground">
              No cancellation fees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ShieldCheck className="h-10 w-10 text-primary" />

          <div>
            <h3 className="font-semibold">
              Trusted Service
            </h3>

            <p className="text-sm text-muted-foreground">
              Reliable pickup and delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}