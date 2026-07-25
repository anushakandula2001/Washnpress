"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type Kpis = {
  residents: number;
  operators: number;
  orders: number;
  revenue: number;
  subscriptions: number;
  walletBalance: number;
  supportTickets: number;
  societies: number;
};

const modules = [
  { title: "Residents", href: "/admin/residents", desc: "Profiles, wallets, subscriptions" },
  { title: "Operators", href: "/admin/operators", desc: "Create and manage ops accounts" },
  { title: "Societies", href: "/admin/societies", desc: "Network coverage and units" },
  { title: "Orders", href: "/admin/orders", desc: "Cross-portal order oversight" },
  { title: "Pickups", href: "/admin/pickups", desc: "Scheduled and completed pickups" },
  { title: "Deliveries", href: "/admin/deliveries", desc: "Delivery pipeline status" },
  { title: "Pricing", href: "/admin/pricing", desc: "Garments, fees, and taxes" },
  { title: "Subscriptions", href: "/admin/subscriptions", desc: "Plans and enrollments" },
  { title: "Payments", href: "/admin/payments", desc: "Payments, wallet, refunds" },
  { title: "Add-ons", href: "/admin/addons", desc: "Optional pickup services" },
  { title: "Notifications", href: "/admin/notifications", desc: "Broadcast messages" },
  { title: "Support", href: "/admin/support", desc: "Tickets and escalations" },
  { title: "Reports", href: "/admin/reports", desc: "Exportable summaries" },
  { title: "Analytics", href: "/admin/analytics", desc: "Revenue and growth" },
  { title: "Performance", href: "/admin/performance", desc: "Operator metrics" },
  { title: "System Health", href: "/admin/system-health", desc: "Service status checks" },
];

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load dashboard");
        if (!cancelled) setKpis(data.kpis as Kpis);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Admin Dashboard"
      subtitle="Live platform metrics from PostgreSQL"
    >
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/residents" className="no-underline">
          <KpiCard label="Residents" value={String(kpis?.residents ?? "—")} footnote="Open directory" />
        </Link>
        <Link href="/admin/operators" className="no-underline">
          <KpiCard label="Operators" value={String(kpis?.operators ?? "—")} footnote="Open operators" />
        </Link>
        <Link href="/admin/societies" className="no-underline">
          <KpiCard label="Societies" value={String(kpis?.societies ?? "—")} footnote="Open societies" />
        </Link>
        <Link href="/admin/orders" className="no-underline">
          <KpiCard label="Orders" value={String(kpis?.orders ?? "—")} footnote="Open orders" />
        </Link>
        <Link href="/admin/pickups" className="no-underline">
          <KpiCard label="Pickups" value="View" footnote="Today's schedule" />
        </Link>
        <Link href="/admin/deliveries" className="no-underline">
          <KpiCard label="Deliveries" value="View" footnote="Delivery pipeline" />
        </Link>
        <Link href="/admin/payments" className="no-underline">
          <KpiCard
            label="Wallet Balance"
            value={kpis ? inr(kpis.walletBalance) : "—"}
            footnote="Open payments"
          />
        </Link>
        <Link href="/admin/subscriptions" className="no-underline">
          <KpiCard
            label="Subscriptions"
            value={String(kpis?.subscriptions ?? "—")}
            footnote="Active plans"
          />
        </Link>
        <Link href="/admin/analytics" className="no-underline">
          <KpiCard
            label="Revenue"
            value={kpis ? inr(kpis.revenue) : "—"}
            footnote="Open analytics"
          />
        </Link>
        <Link href="/admin/support" className="no-underline">
          <KpiCard
            label="Support Tickets"
            value={String(kpis?.supportTickets ?? "—")}
            footnote="Open support"
          />
        </Link>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.href}>
            <CardHeader>
              <CardTitle className="text-base">{m.title}</CardTitle>
              <CardDescription>{m.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={m.href} className="no-underline">
                <Button className="w-full">Open</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </PortalShell>
  );
}
