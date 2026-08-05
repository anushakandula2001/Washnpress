"use client";

import { readApiJson } from "@/frontend/api-client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type ReportsData = {
  today: {
    total_orders: number;
    total_garments: number;
    delivered_orders: number;
  };
  weekly: {
    date: string;
    orders: number;
  }[];
  sla: {
    delayed_pickups: number;
    breached_delivery: number;
  };
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/operations/reports", { credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reports");
        return readApiJson(res);
      })
      .then((d) => setData(d))
      .catch((e) => {
        toast("Failed to load reports", "error");
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Operations Reports"
      subtitle="View throughput, SLA metrics, and operational performance"
    >
      {loading || !data ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading metrics...
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Today's Summary</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders Processed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.today.total_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">Orders created today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Garments Processed</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.today.total_garments}</div>
                <p className="text-xs text-muted-foreground mt-1">Total items across orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.today.delivered_orders}</div>
                <p className="text-xs text-muted-foreground mt-1">Orders successfully delivered</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold tracking-tight mt-10">SLA & Exceptions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Delayed Pickups</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.sla.delayed_pickups}</div>
                <p className="text-xs text-muted-foreground mt-1"> 4 hours past schedule</p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Breached Delivery SLA</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.sla.breached_delivery}</div>
                <p className="text-xs text-muted-foreground mt-1">{"Delivered > 48hrs from pickup"}</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold tracking-tight mt-10">Weekly Trend</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Orders per Day (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.weekly.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No data for the last 7 days</div>
              ) : (
                <div className="space-y-4">
                  {data.weekly.map((w) => (
                    <div key={w.date} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <div className="flex-1 mx-4">
                        <div className="h-2 rounded-full bg-primary/20 overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ 
                              width: `${Math.min(100, (w.orders / Math.max(...data.weekly.map(x => x.orders), 1)) * 100)}%` 
                            }} 
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{w.orders}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PortalShell>
  );
}
