"use client";

import { Activity, UserPlus, Wallet, ShoppingBag, Package, Crown, LogIn } from "lucide-react";

export function ResidentActivity({ data }: { data: Record<string, unknown> }) {
  const r = data.resident as Record<string, unknown>;
  const orders = (data.orders as Array<Record<string, unknown>>) ?? [];
  const walletTx = (data.walletTx as Array<Record<string, unknown>>) ?? [];
  const sub = data.subscription as Record<string, unknown> | null;

  const events: Array<{ icon: typeof Activity; label: string; date: string }> = [];

  if (r.created_at) events.push({ icon: UserPlus, label: "Registered", date: String(r.created_at) });
  if (r.last_login_at) events.push({ icon: LogIn, label: "Last Login", date: String(r.last_login_at) });
  if (sub) events.push({ icon: Crown, label: `Subscription: ${sub.tier}`, date: String(sub.cycle_start ?? "") });
  walletTx.slice(0, 3).forEach((t) => {
    events.push({ icon: Wallet, label: `Wallet ${t.type}: ₹${t.amount_inr}`, date: String(t.created_at) });
  });
  orders.slice(0, 5).forEach((o) => {
    events.push({
      icon: o.status === "Delivered" ? Package : ShoppingBag,
      label: `Order ${o.order_code} — ${o.status}`,
      date: String(o.created_at),
    });
  });

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative space-y-0 pl-6">
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border" />
      {events.map((e, i) => {
        const Icon = e.icon;
        return (
          <div key={i} className="relative pb-6">
            <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="h-3 w-3 text-primary" />
            </div>
            <p className="text-sm font-medium">{e.label}</p>
            <p className="text-xs text-muted-foreground">{e.date ? new Date(e.date).toLocaleString() : "—"}</p>
          </div>
        );
      })}
      {events.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded</p>}
    </div>
  );
}
