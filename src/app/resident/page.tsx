"use client";

import Link from "next/link";
import { useState } from "react";
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
import {
  residentProfile,
  residentSubscription,
  orderTrackingEvents,
  formatPickupDisplay,
  residentImpact,
} from "@/lib/resident-data";

const quickActions = [
  { label: "Schedule Pickup", href: "/resident/pickup", icon: CalendarClock },
  { label: "Add-ons", href: "/resident/addons", icon: Puzzle },
  { label: "My Orders", href: "/resident/orders", icon: Package },
  { label: "Wallet", href: "/resident/wallet", icon: Wallet },
  { label: "Support", href: "/resident/support", icon: Headphones },
];

export default function ResidentDashboard() {
  const { balance, transactions, pickup, orders, selectedOrderId, setSelectedOrderId, selectedOrder } =
    useResident();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const activeOrder = selectedOrder ?? orders[0];
  const trackingEvents = orderTrackingEvents[activeOrder?.id] ?? [];

  const usagePercent = Math.round(
    (residentSubscription.garmentsUsed / residentSubscription.garmentCap) * 100,
  );

  return (
    <ResidentShell
      greeting={`Hello, ${residentProfile.name} 👋`}
      subtitle="Good to see you back!"
    >
      {/* Top summary row */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your Active Plan
                </p>
                <p className="mt-1 text-lg font-bold">{residentSubscription.planName}</p>
              </div>
              <Link
                href="/resident/subscription"
                className="text-sm font-medium text-primary hover:underline"
              >
                View Details →
              </Link>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {residentSubscription.garmentsUsed} / {residentSubscription.garmentCap} Garments Used
                </span>
                <span className="font-medium text-primary">{residentSubscription.daysRemaining} Days Remaining</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted">
                <div
                  className="h-2.5 rounded-full bg-primary transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
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
                  <p className="mt-1 text-sm font-semibold">{activeOrder?.status === "In Wash" ? "In Wash / Ironing" : activeOrder?.displayStatus}</p>
                  <p className="text-xs text-muted-foreground">Order: #{activeOrder?.id}</p>
                </div>
                <Link
                  href={`/resident/orders?id=${activeOrder?.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick actions + refer banner */}
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

      {/* Three-column main grid */}
      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/resident/orders" className="text-xs font-medium text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.slice(0, 2).map((order) => (
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
            ))}
          </CardContent>
        </Card>

        {/* Order Tracking */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Tracking</CardTitle>
            <p className="text-xs text-muted-foreground">
              #{activeOrder?.id} · Placed: {activeOrder?.placedDate}
            </p>
          </CardHeader>
          <CardContent>
            <OrderVerticalTimeline events={trackingEvents} />
            <div className="mt-2 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted/60">
                <svg viewBox="0 0 64 64" className="h-16 w-16 text-primary/60" fill="currentColor">
                  <rect x="12" y="8" width="40" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="32" cy="36" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="32" cy="36" r="2" />
                  <rect x="20" y="14" width="24" height="4" rx="1" opacity="0.5" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/resident/orders?id=${activeOrder?.id}`} className="flex-1">
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
          </CardContent>
        </Card>

        {/* Wallet */}
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

      {/* Footer info cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sustainability Impact</p>
              <p className="text-sm font-semibold">
                Water Saved: {residentImpact.waterSavedLiters.toLocaleString()} L
              </p>
              <p className="text-xs text-muted-foreground">
                CO₂ Reduced: {residentImpact.co2ReducedKg} kg
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
