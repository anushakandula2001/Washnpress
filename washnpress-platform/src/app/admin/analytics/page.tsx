"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { adminNav } from "@/lib/portal-nav";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/analytics", { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  const revenue = data?.revenue as { mrr?: number; totalBilled?: number } | undefined;
  const operations = data?.operations as {
    totalOrders?: number;
    delivered?: number;
    inProgress?: number;
  } | undefined;
  const byMonth = (data?.byMonth as Array<{ month: string; orders: number }>) ?? [];
  const topSocieties = (data?.topSocieties as Array<{ name: string; orders: number }>) ?? [];
  const residentsGrowth =
    (data?.residentsGrowth as Array<{ month: string; residents: number }>) ?? [];

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Analytics"
      subtitle="Revenue, orders, and growth from PostgreSQL"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="MRR" value={revenue ? `₹${revenue.mrr?.toLocaleString("en-IN")}` : "—"} />
        <KpiCard
          label="Total billed"
          value={revenue ? `₹${revenue.totalBilled?.toLocaleString("en-IN")}` : "—"}
        />
        <KpiCard label="Orders" value={String(operations?.totalOrders ?? "—")} />
        <KpiCard label="In progress" value={String(operations?.inProgress ?? "—")} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {byMonth.map((m) => (
              <div key={m.month} className="flex justify-between">
                <span>{m.month}</span>
                <span className="font-medium">{m.orders}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top societies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {topSocieties.map((s) => (
              <div key={s.name} className="flex justify-between">
                <span>{s.name}</span>
                <span className="font-medium">{s.orders}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resident growth</CardTitle>
            <CardDescription>Monthly registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {residentsGrowth.map((m) => (
              <div key={m.month} className="flex justify-between">
                <span>{m.month}</span>
                <span className="font-medium">{m.residents}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
