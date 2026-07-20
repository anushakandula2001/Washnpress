"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { operationsNav } from "@/lib/portal-nav";

type Kpis = {
  todayPickups: number;
  pendingPickups: number;
  washing: number;
  drying: number;
  ironing: number;
  qc: number;
  readyDelivery: number;
  completedToday: number;
  delayed: number;
  unreadNotifications: number;
};

type Activity = {
  order_code: string;
  status: string;
  updated_at: string;
  society_name: string;
  resident_name: string;
};

const queueLinks = [
  { label: "Today's Pickups", href: "/operations/pickups", key: "todayPickups" as const },
  { label: "Washing", href: "/operations/washing", key: "washing" as const },
  { label: "Drying", href: "/operations/drying", key: "drying" as const },
  { label: "Ironing", href: "/operations/ironing", key: "ironing" as const },
  { label: "QC", href: "/operations/qc", key: "qc" as const },
  { label: "Ready for Delivery", href: "/operations/ready-delivery", key: "readyDelivery" as const },
];

export default function OperationsDashboardPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/operations/dashboard", { credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load dashboard");
        if (cancelled) return;
        setKpis(data.kpis as Kpis);
        setActivity((data.recentActivity as Activity[]) ?? []);
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
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Operations Dashboard"
      subtitle="Live laundry lifecycle from PostgreSQL"
    >
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Today Pickups" value={String(kpis?.todayPickups ?? "—")} footnote="Scheduled for today" />
        <KpiCard label="Pending Pickups" value={String(kpis?.pendingPickups ?? "—")} footnote="Awaiting pickup" />
        <KpiCard label="In Processing" value={String((kpis?.washing ?? 0) + (kpis?.drying ?? 0) + (kpis?.ironing ?? 0))} footnote="Wash → Iron" />
        <KpiCard label="Completed Today" value={String(kpis?.completedToday ?? "—")} footnote={`Delayed: ${kpis?.delayed ?? 0}`} />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {queueLinks.map((q) => (
          <Card key={q.href}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{q.label}</CardTitle>
              <CardDescription>{kpis ? `${kpis[q.key]} orders` : "Loading…"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={q.href} className="no-underline">
                <Button className="w-full">Open queue</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>{kpis ? `${kpis.unreadNotifications} unread` : "Loading…"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/operations/notifications" className="no-underline">
              <Button className="w-full" variant="outline">
                Open inbox
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pickup Slots</CardTitle>
            <CardDescription>Manage resident booking capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/operations/pickup-slots" className="no-underline">
              <Button className="w-full" variant="outline">
                Manage slots
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest order status changes in your societies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent orders yet.</p>
            ) : (
              activity.map((row) => (
                <div
                  key={`${row.order_code}-${row.updated_at}`}
                  className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium">{row.order_code}</span>
                  <span className="text-muted-foreground">
                    {row.resident_name} · {row.society_name}
                  </span>
                  <span>{row.status}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </PortalShell>
  );
}
