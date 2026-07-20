"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  Puzzle,
  Package,
  Wallet,
  Headphones,
  Gift,
  Leaf,
  Headset,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
} from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { OrderHorizontalStepper } from "@/components/resident/order-stepper";
import { OrderVerticalTimeline } from "@/components/resident/order-timeline";
import { AddMoneyModal } from "@/components/resident/add-money-modal";
import { RescheduleModal } from "@/components/resident/reschedule-modal";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPickupDisplay, type TrackingEvent } from "@/lib/resident-data";
import { api } from "@/frontend/api-client";

const quickActions = [
  { label: "Schedule Pickup", href: "/resident/pickup", icon: CalendarClock },
  { label: "Add-ons", href: "/resident/addons", icon: Puzzle },
  { label: "My Orders", href: "/resident/orders", icon: Package },
  { label: "Wallet", href: "/resident/wallet", icon: Wallet },
  { label: "Support", href: "/resident/support", icon: Headphones },
];

export default function ResidentDashboard() {
  const {
    loading,
    profile,
    subscription,
    balance,
    transactions,
    pickup,
    orders,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,
    getOrderTracking,
  } = useResident();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [impact, setImpact] = useState({
    waterSavedLiters: 0,
    co2ReducedKg: 0,
  });

  const activeOrder = selectedOrder ?? orders[0];
  const displayName = profile?.name || "Resident";
  const residentIdLabel = profile?.residentCode ? ` · ${profile.residentCode}` : "";

  const usagePercent =
    subscription && subscription.garmentCap > 0
      ? Math.round((subscription.garmentsUsed / subscription.garmentCap) * 100)
      : 0;

  useEffect(() => {
    if (!activeOrder?.id) {
      setTrackingEvents([]);
      return;
    }
    let cancelled = false;
    void getOrderTracking(activeOrder.id).then((events) => {
      if (!cancelled) setTrackingEvents(events);
    });
    return () => {
      cancelled = true;
    };
  }, [activeOrder?.id, getOrderTracking]);

  useEffect(() => {
    void api.sustainability()
      .then((data) => {
        setImpact({
          waterSavedLiters: Number(data.totalSavedLiters ?? 0),
          co2ReducedKg: Math.round(Number(data.totalSavedLiters ?? 0) * 0.002),
        });
      })
      .catch(() => undefined);
  }, []);

  return (
    <ResidentShell
      greeting={`Welcome back, ${displayName}`}
      subtitle={
        loading
          ? "Loading your laundry hub…"
          : `Good to see you back!${residentIdLabel}`
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your Active Plan
                </p>
                <p className="mt-1 text-lg font-bold">
                  {subscription?.planName ?? "No active plan"}
                </p>
              </div>
              <Link
                href="/resident/subscription"
                className="text-sm font-medium text-primary hover:underline"
              >
                View Details →
              </Link>
            </div>
            {subscription ? (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {subscription.garmentsUsed} / {subscription.garmentCap} Garments Used
                  </span>
                  <span className="font-medium text-primary">
                    {subscription.daysRemaining} Days Remaining
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted">
                  <div
                    className="h-2.5 rounded-full bg-primary transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Subscribe to unlock monthly garment caps and priority pickup.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Next Pickup</p>
                  <p className="mt-1 text-sm font-semibold">{formatPickupDisplay(pickup)}</p>
                </div>
                <button
                  onClick={() => setRescheduleOpen(true)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Reschedule
                </button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Order Status</p>
                  <p className="mt-1 text-sm font-semibold">
                    {activeOrder?.displayStatus ?? "No active orders"}
                  </p>
                  {activeOrder && (
                    <p className="text-xs text-muted-foreground">Order: #{activeOrder.id}</p>
                  )}
                </div>
                {activeOrder && (
                  <Link
                    href={`/resident/orders?id=${activeOrder.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-card p-3 text-center transition hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-primary text-primary-foreground lg:col-span-2">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div>
              <p className="text-lg font-bold">Refer & Earn</p>
              <p className="mt-1 text-sm opacity-90">
                Refer a friend and get ₹100 wallet credits on their first order.
              </p>
              <Link
                href="/resident/wallet"
                className="mt-2 inline-flex items-center text-sm font-semibold hover:underline"
              >
                Learn More →
              </Link>
            </div>
            <Gift className="absolute bottom-2 right-2 h-20 w-20 opacity-20" />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/resident/orders" className="text-xs font-medium text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No orders yet. Schedule a pickup to get started.
              </p>
            ) : (
              orders.slice(0, 2).map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedOrderId === order.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        Pickup: {order.pickupDate} · {order.pickupTime}
                      </p>
                    </div>
                    <Badge variant={order.badgeVariant}>{order.displayStatus}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {order.garments} items
                    {order.addons.length > 0 && ` · ${order.addons.join(", ")}`}
                  </p>
                  <div className="mt-3">
                    <OrderHorizontalStepper
                      stages={order.stages}
                      currentStage={order.currentStage}
                      compact
                    />
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Tracking</CardTitle>
            <p className="text-xs text-muted-foreground">
              {activeOrder
                ? `#${activeOrder.id} · Placed: ${activeOrder.placedDate}`
                : "Select an order to track"}
            </p>
          </CardHeader>
          <CardContent>
            {activeOrder ? (
              <>
                <OrderVerticalTimeline events={trackingEvents} />
                <div className="mt-4 flex gap-2">
                  <Link href={`/resident/orders?id=${activeOrder.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Order Details
                    </Button>
                  </Link>
                  <Link href="/resident/support" className="flex-1">
                    <Button variant="outline" className="w-full gap-1" size="sm">
                      <Phone className="h-3.5 w-3.5" />
                      Need Help?
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No order to track yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{balance.toFixed(2)}</p>
              <Button size="sm" onClick={() => setAddMoneyOpen(true)}>
                Add Money
              </Button>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recent Transactions
            </p>
            <div className="mt-2 space-y-2">
              {transactions.slice(0, 3).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        txn.type === "credit" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {txn.type === "credit" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{txn.description}</p>
                      <p className="text-[10px] text-muted-foreground">{txn.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      txn.type === "credit" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}₹{txn.amountInr}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
              )}
            </div>
            <Link
              href="/resident/wallet"
              className="mt-3 block text-center text-xs font-medium text-primary hover:underline"
            >
              View All Transactions
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sustainability Impact</p>
              <p className="text-sm font-semibold">
                Water Saved: {impact.waterSavedLiters.toLocaleString()} L
              </p>
              <p className="text-xs text-muted-foreground">
                CO₂ Reduced: {impact.co2ReducedKg} kg
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Headset className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Support Center</p>
              <p className="text-sm font-semibold">We&apos;re here to help</p>
              <Link href="/resident/support" className="text-xs text-primary hover:underline">
                Chat or call us anytime
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Stay Updated</p>
              <p className="text-sm font-semibold">Get pickup & delivery alerts</p>
              <Link href="/resident/profile" className="text-xs text-primary hover:underline">
                Manage notifications
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
      <RescheduleModal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} />
    </ResidentShell>
  );
}
