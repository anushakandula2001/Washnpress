"use client";

import {
  ShoppingBag,
  Clock,
  Cog,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  CalendarClock,
} from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderRow, OrderTab } from "./types";

function countByStatuses(rows: OrderRow[], statuses: string[]) {
  const set = new Set(statuses.map((s) => s.toLowerCase()));
  return rows.filter((r) => set.has(r.status.toLowerCase())).length;
}

export function OrderStats({
  rows,
  loading,
  onTabChange,
}: {
  rows: OrderRow[];
  loading?: boolean;
  onTabChange?: (tab: OrderTab) => void;
}) {
  if (loading) {
    return (
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </section>
    );
  }

  const pending = countByStatuses(rows, ["Scheduled"]);
  const processing = countByStatuses(rows, ["Picked Up", "In Wash", "Dry", "QC Hold"]);
  const ready = countByStatuses(rows, ["Iron"]);
  const out = countByStatuses(rows, ["Out for Delivery"]);
  const completed = countByStatuses(rows, ["Delivered"]);
  const cancelled = countByStatuses(rows, ["Cancelled"]);
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = rows.filter((r) => r.created_at.slice(0, 10) === today).length;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      <StatCard
        title="Total Orders"
        value={rows.length}
        icon={ShoppingBag}
        onClick={() => onTabChange?.("all")}
      />
      <StatCard
        title="Pending Pickup"
        value={pending}
        icon={Clock}
        accent="orange"
        onClick={() => onTabChange?.("pending_pickup")}
      />
      <StatCard
        title="Processing"
        value={processing}
        icon={Cog}
        accent="blue"
        onClick={() => onTabChange?.("processing")}
      />
      <StatCard
        title="Ready"
        value={ready}
        icon={PackageCheck}
        accent="gold"
        onClick={() => onTabChange?.("ready")}
      />
      <StatCard
        title="Out for Delivery"
        value={out}
        icon={Truck}
        accent="primary"
        onClick={() => onTabChange?.("out")}
      />
      <StatCard
        title="Completed"
        value={completed}
        icon={CheckCircle2}
        accent="green"
        onClick={() => onTabChange?.("completed")}
      />
      <StatCard
        title="Cancelled"
        value={cancelled}
        icon={XCircle}
        accent="red"
        onClick={() => onTabChange?.("cancelled")}
      />
      <StatCard title="Today" value={todayCount} icon={CalendarClock} trendLabel="Created today" />
    </section>
  );
}
