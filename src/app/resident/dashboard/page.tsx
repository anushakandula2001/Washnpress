"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
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

const quickActions = [
  {
    label: "Schedule Pickup",
    href: "/resident/pickup",
    icon: CalendarClock,
  },
  {
    label: "My Orders",
    href: "/resident/orders",
    icon: Package,
  },
  {
    label: "Subscription",
    href: "/resident/subscription",
    icon: CreditCard,
  },
  {
    label: "Wallet",
    href: "/resident/wallet",
    icon: Wallet,
  },
  {
    label: "Support",
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

export default function ResidentDashboard() {
  const {
    loading,
    profile,
    subscription,
    balance,
    pickup,
    orders,
    selectedOrder,
  } = useResident();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const displayName = profile?.name ?? "Resident";
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

  const pickupLabel = pickup.date
    ? `${formatDate(pickup.date)} · ${pickup.startTime ?? "TBD"}`
    : "No pickup scheduled";

  const orderLabel = activeOrder?.id ? `#${activeOrder.id}` : "No order";
  const orderStatus = activeOrder?.displayStatus ?? "No order";

  return (
    <ResidentShell
      greeting={`Welcome back, ${displayName}`}
      subtitle={
        loading
          ? "Loading your laundry hub…"
          : "Everything you need for your next laundry run is right here."
      }
    >
      <div className="space-y-6">
        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.7fr]">
          <article className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Next Pickup</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{pickupLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleOpen(true)}
                className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-slate-100"
              >
                Reschedule
              </button>
            </div>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Order status</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{orderLabel}</p>
              <p className="text-sm text-muted-foreground">{orderStatus}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Next Pickup</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{pickupLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleOpen(true)}
                className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-slate-100"
              >
                Reschedule
              </button>
            </div>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Order status</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{orderLabel}</p>
              <p className="text-sm text-muted-foreground">{orderStatus}</p>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Quick Actions</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Quick actions</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-foreground transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <article className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Recent orders</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">Recent orders</h2>
              </div>
              <Link href="/resident/orders" className="text-sm font-semibold text-primary transition hover:text-primary/80">
                View all →
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {latestOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">No recent orders yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">Your latest orders will appear here after your next pickup.</p>
                </div>
              ) : (
                latestOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/resident/orders?id=${order.id}`}
                    className="group block rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">#{order.id}</p>
                        <p className="text-xs text-muted-foreground">Placed {formatDate(order.placedDate)}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {order.displayStatus}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
                      <div>
                        <p className="font-semibold text-foreground">{order.garments} items</p>
                        <p className="text-muted-foreground">Garments</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{formatDate(order.pickupDate)}</p>
                        <p className="text-muted-foreground">Pickup</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{formatDate(order.pickupDate)}</p>
                        <p className="text-muted-foreground">Delivery</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Wallet</p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">₹{balance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2>
            </div>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => setAddMoneyOpen(true)}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Add Money
              </button>
              <Link
                href="/resident/wallet"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-50"
              >
                View Wallet
              </Link>
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-foreground">Refer & earn</p>
              <p className="mt-2 text-sm text-muted-foreground">Refer a friend and get wallet credits on their first order.</p>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">My subscription plan</p>
            <h2 className="text-2xl font-semibold text-foreground">
              {subscription ? subscription.planName : "No active plan"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {subscription
                ? "Your plan keeps laundry simple with priority pickup and monthly garments."
                : "Subscribe to unlock monthly garment caps and priority pickup."}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/resident/subscription"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-100"
            >
              View Details
            </Link>
            <Link
              href="/resident/pickup"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Schedule Pickup
            </Link>
          </div>
        </section>
      </div>

      <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
      <RescheduleModal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} />
    </ResidentShell>
  );
}
