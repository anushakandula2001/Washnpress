"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";

export function OperatorPerformance({ data }: { data: Record<string, unknown> }) {
  const stats = (data.stats as Record<string, number>) ?? {};
  const completionRate = stats.orders ? Math.round(((stats.completed ?? 0) / stats.orders) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Residents" value={stats.residents ?? 0} icon={BarChart3} accent="primary" />
        <StatCard title="Orders" value={stats.orders ?? 0} icon={TrendingUp} accent="blue" />
        <StatCard title="Completed" value={stats.completed ?? 0} icon={TrendingUp} accent="green" />
        <StatCard title="Pending" value={stats.pending ?? 0} icon={BarChart3} accent="orange" />
      </div>

      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 font-medium">Performance Metrics</h4>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Order Completion</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-xs text-muted-foreground">Avg Orders / Society</p>
              <p className="font-bold">
                {((data.societies as unknown[])?.length ?? 0) > 0
                  ? Math.round((stats.orders ?? 0) / ((data.societies as unknown[])?.length ?? 1))
                  : 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-xs text-muted-foreground">Residents / Society</p>
              <p className="font-bold">
                {((data.societies as unknown[])?.length ?? 0) > 0
                  ? Math.round((stats.residents ?? 0) / ((data.societies as unknown[])?.length ?? 1))
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
