"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CreditCard,
  Gift,
  Headphones,
  Package,
  Wallet,
} from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { AddMoneyModal } from "@/components/resident/add-money-modal";
import { RescheduleModal } from "@/components/resident/reschedule-modal";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  {
    label: "Schedule Pickup",
    description: "Book your laundry pickup",
    href: "/resident/pickup",
    icon: CalendarClock,
  },
  {
    label: "My Orders",
    description: "Review your latest orders",
    href: "/resident/orders",
    icon: Package,
  },
  {
    label: "Subscription",
    description: "View your plan details",
    href: "/resident/subscription",
    icon: CreditCard,
  },
  {
    label: "Wallet",
    description: "Check your balance",
    href: "/resident/wallet",
    icon: Wallet,
  },
  {
    label: "Support",
    description: "Contact our support team",
    href: "/resident/support",
    icon: Headphones,
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function estimateDeliveryDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "TBD";
  const estimated = new Date(date);
  estimated.setDate(date.getDate() + 2);
  return estimated.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ResidentDashboard() {
  const {
    loading,
    profile,
    subscription,
    balance,
    transactions,
    pickup,
    orders,
    selectedOrder,
  } = useResident();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const displayName = profile?.name ?? "Resident";
  const remainingGarments = subscription
    ? Math.max(subscription.garmentCap - subscription.garmentsUsed, 0)
    : 0;
  const usagePercent = subscription && subscription.garmentCap > 0
    ? Math.round((subscription.garmentsUsed / subscription.garmentCap) * 100)
    : 0;

  const activeOrder = useMemo(
    () => selectedOrder ?? orders[0],
    [orders, selectedOrder],
  );

  const latestOrders = useMemo(
    () => [...orders]
      .sort((a, b) => b.placedDate.localeCompare(a.placedDate))
      .slice(0, 3),
    [orders],
  );

  const rewardPoints = useMemo(
    () => transactions.reduce((sum, txn) => {
      const lower = txn.description.toLowerCase();
      if (lower.includes("referral") || lower.includes("reward") || lower.includes("bonus")) {
        return sum + 50;
      }
      return sum;
    }, 0),
    [transactions],
  );

  const recentCashback = useMemo(
    () => transactions.reduce((sum, txn) => {
      const lower = txn.description.toLowerCase();
      if (txn.type === "credit" && (lower.includes("cashback") || lower.includes("referral"))) {
        return sum + txn.amountInr;
      }
      return sum;
    }, 0),
    [transactions],
  );

  return (
    <ResidentShell
      greeting={`Welcome back, ${displayName}`}
      subtitle={
        loading
          ? "Loading your laundry hub…"
          : "Everything you need for your next laundry run is right here."
      }
    >
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="h-full shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Subscription overview</CardTitle>
              <p className="text-sm text-muted-foreground">Your current plan and renewal details.</p>
            </div>
            {subscription ? <Badge variant="secondary">Active</Badge> : null}
          </CardHeader>
          <CardContent className="pt-0">
            {subscription ? (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-border bg-slate-50 p-6">
                  <p className="text-sm text-muted-foreground">{subscription.planName}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    {remainingGarments} / {subscription.garmentCap} Garments Remaining
                  </p>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-border bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next Renewal</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{subscription.renewsOn}</p>
                  </div>
                  <div className="rounded-[28px] border border-border bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">₹{subscription.monthlyInr.toLocaleString("en-IN")} / Month</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/resident/subscription"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    View Plan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-dashed border-border bg-slate-50 p-8 text-center">
                  <p className="text-lg font-semibold text-foreground">No Active Subscription</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Subscribe to a plan to unlock monthly garment limits, faster turnaround and priority service.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/resident/subscription"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Subscribe Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Link
            href="/resident/pickup"
            className="group block h-full rounded-[28px] border border-border bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next Pickup</p>
                <p className="mt-4 text-xl font-semibold text-foreground">{pickup.date ? formatDate(pickup.date) : "No pickup scheduled"}</p>
              </div>
              <div className="rounded-3xl bg-sky-100 p-3 text-sky-700 transition group-hover:bg-sky-200">
                <CalendarClock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Pickup Time</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {pickup.startTime ? `${pickup.startTime} – ${pickup.endTime}` : "Not set"}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-semibold text-primary">Reschedule Pickup →</span>
              </div>
            </div>
          </Link>

          <Link
            href={activeOrder ? `/resident/orders?id=${activeOrder.id}` : "/resident/orders"}
            className="group block h-full rounded-[28px] border border-border bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current Order</p>
                <p className="mt-4 text-xl font-semibold text-foreground">
                  {activeOrder?.displayStatus ?? "No current order"}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-3 text-slate-700 transition group-hover:bg-slate-200">
                <Package className="h-6 w-6" />
              </div>
            </div>
            {activeOrder ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Order Number</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">#{activeOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup Slot</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {pickup.startTime ? `${pickup.startTime} – ${pickup.endTime}` : "TBD"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Stage</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{activeOrder.currentStage}</p>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-semibold text-primary">View Details →</span>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">Select an order to view full details.</p>
            )}
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Quick actions</CardTitle>
              <p className="text-sm text-muted-foreground">Go directly to the tools you use most.</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex h-28 flex-col justify-between rounded-[28px] border border-border bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-600 to-slate-700 text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardContent className="space-y-6 p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-100/80">What's next?</p>
              <h2 className="mt-3 text-2xl font-semibold">Your pickup is on the calendar.</h2>
              <p className="mt-3 text-sm leading-6 text-sky-100/90">
                Keep your laundry routine effortless with one tap from your dashboard.
              </p>
            </div>
            <Link
              href="/resident/pickup"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Schedule Pickup
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <p className="text-sm text-muted-foreground">Your latest laundry orders at a glance.</p>
            </div>
            <Link href="/resident/orders" className="text-sm font-medium text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent orders yet.</p>
            ) : (
              latestOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/resident/orders?id=${order.id}`}
                  className="block rounded-[28px] border border-border bg-slate-50 p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.displayStatus}</p>
                    </div>
                    <Badge variant={order.badgeVariant}>{order.displayStatus}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pickup</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(order.pickupDate)}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Delivery</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{estimateDeliveryDate(order.pickupDate)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Garments</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{order.garments}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Amount</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">₹-</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Wallet summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-[28px] border border-border bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wallet balance</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">₹{balance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-border bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reward Points</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{rewardPoints}</p>
                  </div>
                  <div className="rounded-[28px] border border-border bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recent cashback</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">₹{recentCashback.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button size="lg" className="w-full" onClick={() => setAddMoneyOpen(true)}>
                    Add Money
                  </Button>
                  <Link
                    href="/resident/wallet"
                    className="inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-100"
                  >
                    View Wallet
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Refer & Earn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-[28px] border border-border bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Invite your neighbours</p>
                  <p className="text-sm text-muted-foreground">
                    Earn wallet credits when they complete their first order.
                  </p>
                </div>
              </div>
              <Link
                href="/resident/wallet"
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Refer friends
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <span className="text-xl">💧</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sustainability Impact</p>
              <p className="text-sm font-semibold">
                Water Saved: {0} L
              </p>
              <p className="text-xs text-muted-foreground">
                CO₂ Reduced: {0} kg
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Headphones className="h-5 w-5" />
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
