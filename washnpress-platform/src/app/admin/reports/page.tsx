"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type DailyReport = { day: string; orders: number; delivered: number; garments: number } | null;
type WeeklyRow = { week: string; orders: number };
type MonthlyRow = { month: string; orders: number; delivered: number };
type SocietyRow = { name: string; orders: number; delivered: number };
type OperatorRow = { operator: string; orders: number };

type ReportsData = {
  daily: DailyReport;
  weekly: WeeklyRow[];
  monthly: MonthlyRow[];
  bySociety: SocietyRow[];
  byOperator: OperatorRow[];
  revenueTotal: number;
};

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  const lines = [
    keys.join(","),
    ...rows.map((row) =>
      keys.map((k) => {
        const v = row[k];
        const s = v == null ? "" : String(v);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/reports", { credentials: "same-origin" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Failed");
    setData(json as ReportsData);
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Reports"
      subtitle="Operational and revenue summaries with CSV export"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Revenue total</CardTitle>
              <CardDescription>Paid billing invoices</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv("revenue-total.csv", [{ revenueTotal: data?.revenueTotal ?? 0 }])
              }
            >
              CSV export
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data ? inr(data.revenueTotal) : "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Daily</CardTitle>
              <CardDescription>Today&apos;s orders</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!data?.daily}
              onClick={() => data?.daily && downloadCsv("daily-report.csv", [data.daily])}
            >
              CSV export
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            {data?.daily ? (
              <div className="flex flex-wrap gap-6">
                <span>Day: {data.daily.day}</span>
                <span>Orders: {data.daily.orders}</span>
                <span>Delivered: {data.daily.delivered}</span>
                <span>Garments: {data.daily.garments}</span>
              </div>
            ) : (
              <p className="text-muted-foreground">No daily data.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Weekly</CardTitle>
              <CardDescription>Last 8 weeks</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!data?.weekly?.length}
              onClick={() => data?.weekly && downloadCsv("weekly-report.csv", data.weekly)}
            >
              CSV export
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.weekly ?? []).map((w) => (
              <div key={w.week} className="flex justify-between">
                <span>{w.week}</span>
                <span className="font-medium">{w.orders} orders</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Monthly</CardTitle>
              <CardDescription>Last 12 months</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!data?.monthly?.length}
              onClick={() => data?.monthly && downloadCsv("monthly-report.csv", data.monthly)}
            >
              CSV export
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.monthly ?? []).map((m) => (
              <div key={m.month} className="flex justify-between">
                <span>{m.month}</span>
                <span className="font-medium">{m.orders} orders · {m.delivered} delivered</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">By society</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!data?.bySociety?.length}
                onClick={() => data?.bySociety && downloadCsv("by-society.csv", data.bySociety)}
              >
                CSV export
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(data?.bySociety ?? []).map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="font-medium">{s.orders} · {s.delivered} delivered</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">By operator</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!data?.byOperator?.length}
                onClick={() => data?.byOperator && downloadCsv("by-operator.csv", data.byOperator)}
              >
                CSV export
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(data?.byOperator ?? []).map((o) => (
                <div key={o.operator} className="flex justify-between">
                  <span>{o.operator}</span>
                  <span className="font-medium">{o.orders} orders</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}
