"use client";

import React from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import {
  WelcomeSection,
  SummaryCards,
  BookPickupCard,
  CurrentOrderTracking,
  UpcomingPickups,
  WalletMiniCard,
  SubscriptionMiniCard,
  RecentActivities,
  OffersCarousel,
  ResidentFooter,
} from "./components";

export default function ResidentDashboardPage() {
  const { profile, loading } = useResident();

  return (
    <ResidentShell>
      <div className="flex flex-col xl:flex-row gap-6 max-w-full">
        {/* Main Content Column */}
        <div className="flex-1 min-w-0 space-y-6">
          <WelcomeSection name={profile?.name} />

          <SummaryCards />

          <div className="grid lg:grid-cols-2 gap-6">
            <BookPickupCard />
            <div className="space-y-6">
              <OffersCarousel />
            </div>
          </div>

          <CurrentOrderTracking />
        </div>
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

            <section className="rounded-3xl border border-border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
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
                      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span>{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Right Sidebar Column (Hidden on smaller screens, collapses to bottom on tablet) */}
            <div className="w-full xl:w-80 shrink-0 space-y-6">
              <div className="xl:sticky xl:top-[5.5rem] space-y-6">
                <UpcomingPickups />

                <div className="grid grid-cols-2 xl:grid-cols-1 gap-6">
                  <SubscriptionMiniCard />
                  <WalletMiniCard />
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
                        className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">#{order.id}</p>
                            <p className="text-xs text-muted-foreground">Placed {formatDate(order.placedDate)}</p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
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
          </div>
      </div>

      <ResidentFooter />
    </ResidentShell>
  );
}
