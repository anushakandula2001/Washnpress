"use client";

import { ShoppingBag } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export function OperatorOrders({ data }: { data: Record<string, unknown> }) {
  const stats = (data.stats as Record<string, number>) ?? {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold text-primary">{stats.orders ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-bold">
            {stats.orders ? Math.round(((stats.completed ?? 0) / stats.orders) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <ShoppingBag className="h-4 w-4 text-primary" />
          Order Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivered</span>
            <StatusBadge status="active" />
            <span className="font-medium">{stats.completed ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">In Progress</span>
            <StatusBadge status="pending" />
            <span className="font-medium">{stats.pending ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
