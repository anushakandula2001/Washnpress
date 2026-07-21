"use client";

import {
  Building2,
  Building,
  Users,
  ShoppingBag,
  Crown,
  Wallet,
  UserX,
} from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { SocietyRow } from "./types";

export function SocietyStats({
  rows,
  loading,
  onFilter,
}: {
  rows: SocietyRow[];
  loading?: boolean;
  onFilter?: (filter: string) => void;
}) {
  if (loading) {
    return (
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </section>
    );
  }

  const active = rows.filter((r) => r.status === "active").length;
  const totalResidents = rows.reduce((s, r) => s + (r.residents_count ?? 0), 0);
  const totalOrders = rows.reduce((s, r) => s + (r.orders_count ?? 0), 0);
  const totalSubs = rows.reduce((s, r) => s + (r.subscriptions_count ?? 0), 0);
  const walletRevenue = rows.reduce((s, r) => s + Number(r.wallet_revenue ?? 0), 0);
  const unassigned = rows.filter((r) => !r.assigned_operators).length;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <StatCard title="Total Societies" value={rows.length} icon={Building2} onClick={() => onFilter?.("all")} />
      <StatCard title="Active Societies" value={active} icon={Building} accent="green" onClick={() => onFilter?.("active")} />
      <StatCard title="Total Residents" value={totalResidents.toLocaleString("en-IN")} icon={Users} accent="primary" />
      <StatCard title="Total Orders" value={totalOrders.toLocaleString("en-IN")} icon={ShoppingBag} accent="orange" />
      <StatCard title="Active Subscriptions" value={totalSubs.toLocaleString("en-IN")} icon={Crown} accent="gold" />
      <StatCard title="Wallet Revenue" value={`₹${walletRevenue.toLocaleString("en-IN")}`} icon={Wallet} accent="blue" />
      <StatCard title="Unassigned Societies" value={unassigned} icon={UserX} accent="red" onClick={() => onFilter?.("unassigned")} />
    </section>
  );
}
