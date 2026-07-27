"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, Package, Wallet, Headphones, ArrowRight, Sparkles, Clock3 } from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { AddMoneyModal } from "@/components/resident/add-money-modal";
import { RescheduleModal } from "@/components/resident/reschedule-modal";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPickupDisplay } from "@/lib/resident-data";

const quickActions = [
  { label: "Schedule Pickup", href: "/resident/pickup", icon: CalendarClock },
  { label: "My Orders", href: "/resident/orders", icon: Package },
  { label: "Subscription", href: "/resident/subscription", icon: Sparkles },
  { label: "Wallet", href: "/resident/wallet", icon: Wallet },
  { label: "Support", href: "/resident/support", icon: Headphones },
];

export default function ResidentDashboard() {
  const { loading, profile, subscription, balance, pickup, orders, selectedOrderId, setSelectedOrderId, selectedOrder } = useResident();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const activeOrder = selectedOrder ?? orders[0];
  const displayName = profile?.name || "Resident";
  const usagePercent = subscription && subscription.garmentCap > 0 ? Math.round((subscription.garmentsUsed / subscription.garmentCap) * 100) : 0;
  const nextStepLabel = pickup?.id ? "Your pickup is already scheduled." : "Book your next pickup in a few taps.";

  return (
    <ResidentShell
      greeting={`Welcome back, ${displayName}`}
      subtitle={loading ? "Loading your laundry hub…" : "Everything you need for your next laundry run is right here."}
    >
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <Link href="/resident/subscription" className="block">
            <Card className="h-full border-primary/10 bg-gradient-to-br from-primary/8 via-background to-background transition-all hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscription overview</p>
                    <h2 className="mt-1 text-2xl font-semibold text-foreground">{subscription?.planName ?? "No active plan"}</h2>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View plan <ArrowRight className="h-4 w-4" />
                  </span>
                </div>

                {subscription ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{subscription.garmentsUsed} used</div>
                      <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{subscription.garmentCap - subscription.garmentsUsed} remaining</div>
                      <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{subscription.daysRemaining} days remaining</div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">Choose a plan to unlock monthly garment limits and priority service.</p>
                )}
              </CardContent>
            </Card>
          </Link>

          <div className="space-y-4">
            <Link href="/resident/pickup" className="block">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next pickup</p>
                      <p className="mt-1 text-base font-semibold text-foreground">{formatPickupDisplay(pickup)}</p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Clock3 className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{nextStepLabel}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setRescheduleOpen(true);
                    }}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    Reschedule pickup
                  </button>
                </CardContent>
              </Card>
            </Link>

            <Link href={activeOrder ? `/resident/orders?id=${activeOrder.id}` : "/resident/orders"} className="block">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current order</p>
                      <p className="mt-1 text-base font-semibold text-foreground">{activeOrder?.displayStatus ?? "No active orders"}</p>
                    </div>
                    {activeOrder && (
                      <span className="text-sm font-medium text-primary">View details</span>
                    )}
                  </div>
                  {activeOrder && <p className="mt-3 text-sm text-muted-foreground">Order #{activeOrder.id}</p>}
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} className="flex min-h-[84px] items-center justify-start gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-left leading-5">{action.label}</span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="flex h-full flex-col justify-between p-5">
              <div>
                <p className="text-sm font-medium text-primary">What to do next</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{pickup?.id ? "Your pickup is on the calendar." : "Book your next pickup"}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Keep your routine effortless with one tap from your dashboard.</p>
              </div>
              <Link href="/resident/pickup" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Schedule now <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent orders</CardTitle>
              <Link href="/resident/orders" className="text-sm font-medium text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">No orders yet. Schedule your first pickup to get started.</p>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedOrderId === order.id ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">#{order.id}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Placed {order.placedDate} · {order.garments} items</p>
                      </div>
                      <Badge variant={order.badgeVariant}>{order.displayStatus}</Badge>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Wallet summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-background p-4">
                <p className="text-sm text-muted-foreground">Available balance</p>
                <p className="mt-1 text-3xl font-semibold">₹{balance.toFixed(2)}</p>
                <button onClick={() => setAddMoneyOpen(true)} className="mt-3 text-sm font-medium text-primary hover:underline">Add money</button>
              </div>
              <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Refer & earn</p>
                <p className="mt-1">Share Wash N Press with a friend and earn wallet credits on their first order.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
      <RescheduleModal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} />
    </ResidentShell>
  );
}
