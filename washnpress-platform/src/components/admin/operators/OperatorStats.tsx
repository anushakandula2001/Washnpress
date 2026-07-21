"use client";

import {
  Users,
  UserCheck,
  UserX,
  Building2,
  Home,
  ShoppingBag,
  UserPlus,
  Layers,
} from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { OperatorRow } from "./types";

export function OperatorStats({
  rows,
  loading,
  onFilter,
}: {
  rows: OperatorRow[];
  loading?: boolean;
  onFilter?: (filter: string) => void;
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

  const active = rows.filter((r) => r.status === "active").length;
  const inactive = rows.filter((r) => r.status !== "active").length;
  const societiesCovered = new Set(rows.flatMap((r) => r.societies)).size;
  const residentsTotal = rows.reduce((s, r) => s + (r.residents_count ?? 0), 0);
  const ordersTotal = rows.reduce((s, r) => s + (r.orders_managed ?? 0), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  const newThisMonth = rows.filter((r) => {
    const d = r.created_at ?? r.joined_at;
    return d && new Date(d) >= monthStart;
  }).length;
  const avgSocieties =
    rows.length > 0
      ? (rows.reduce((s, r) => s + (r.societies?.length ?? 0), 0) / rows.length).toFixed(1)
      : "0";
  const unassigned = rows.filter((r) => !r.societies?.length).length;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      <StatCard title="Total Operators" value={rows.length} icon={Users} onClick={() => onFilter?.("all")} />
      <StatCard title="Active" value={active} icon={UserCheck} accent="green" onClick={() => onFilter?.("active")} />
      <StatCard title="Inactive" value={inactive} icon={UserX} accent="red" onClick={() => onFilter?.("inactive")} />
      <StatCard title="Societies Covered" value={societiesCovered} icon={Building2} accent="blue" />
      <StatCard title="Residents Managed" value={residentsTotal} icon={Home} accent="primary" />
      <StatCard title="Orders Managed" value={ordersTotal} icon={ShoppingBag} accent="gold" />
      <StatCard title="New This Month" value={newThisMonth} icon={UserPlus} accent="orange" trend={newThisMonth > 0 ? 8 : 0} />
      <StatCard
        title="Avg Societies / Op"
        value={avgSocieties}
        icon={Layers}
        trendLabel={unassigned > 0 ? `${unassigned} unassigned` : undefined}
        onClick={() => onFilter?.("unassigned")}
      />
    </section>
  );
}
