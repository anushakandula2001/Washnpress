"use client";

import { Building2, Users, ShoppingBag, Crown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/shared/StatCard";
import type { SocietyDetailData } from "./types";

export function SocietyAnalytics({ data }: { data: SocietyDetailData }) {
  const { society, towers, residents, orders } = data;
  const flats = towers.reduce((s, t) => s + t.flats_count, 0);
  const activeOrders = orders.filter((o) => !["cancelled", "delivered"].includes(o.status.toLowerCase())).length;

  const statusBreakdown = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Towers" value={towers.length} icon={Building2} />
        <StatCard title="Flats" value={flats} icon={Building2} accent="blue" />
        <StatCard title="Residents" value={residents.length} icon={Users} accent="green" />
        <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} accent="orange" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex justify-between rounded-md border border-border px-3 py-2">
                <span className="capitalize">{status.replace(/_/g, " ")}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-muted-foreground">No order data yet</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Society Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Active orders: {activeOrders}</p>
            <p className="flex items-center gap-2"><Wallet className="h-4 w-4 text-sky-500" /> Location: {society.city}, {society.state}</p>
            <p>Created: {new Date(society.created_at).toLocaleDateString()}</p>
            <p>Last updated: {new Date(society.updated_at).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
