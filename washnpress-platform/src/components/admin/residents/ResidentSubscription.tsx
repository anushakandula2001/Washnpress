"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

export function ResidentSubscription({ data }: { data: Record<string, unknown> }) {
  const sub = data.subscription as Record<string, unknown> | null;

  if (!sub) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">No active subscription</p>
        <Button size="sm" className="mt-4">Recommend Premium Plan</Button>
      </div>
    );
  }

  const start = sub.cycle_start ? new Date(String(sub.cycle_start)) : null;
  const end = sub.cycle_end ? new Date(String(sub.cycle_end)) : null;
  const now = new Date();
  const remaining = end ? Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000)) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Plan</p>
            <p className="text-xl font-bold">{String(sub.tier)}</p>
          </div>
          <StatusBadge status={String(sub.status)} />
        </div>
        <p className="mt-2 text-sm">₹{String(sub.monthly_inr)}/month · Cap {String(sub.garment_cap)} garments</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-border p-3">
          <p className="text-muted-foreground">Start Date</p>
          <p className="font-medium">{start?.toLocaleDateString() ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-muted-foreground">Expiry Date</p>
          <p className="font-medium">{end?.toLocaleDateString() ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-muted-foreground">Remaining Days</p>
          <p className="font-medium">{remaining}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-muted-foreground">Auto Renewal</p>
          <p className="font-medium">{sub.auto_renew ? "On" : "Off"}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm">Renew</Button>
        <Button size="sm" variant="outline">Upgrade</Button>
      </div>
    </div>
  );
}
