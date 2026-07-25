"use client";

import {
  Users,
  UserCheck,
  Crown,
  Wallet,
  UserPlus,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResidentRow } from "./types";

export function ResidentsStats({
  rows,
  loading,
  onFilter,
}: {
  rows: ResidentRow[];
  loading?: boolean;
  onFilter?: (filter: string) => void;
}) {
  if (loading) {
    return (
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </section>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const active = rows.filter((r) => r.status === "active").length;
  const premium = rows.filter(
    (r) => r.subscription_tier && ["premium", "gold", "platinum"].some((t) => r.subscription_tier?.toLowerCase().includes(t)),
  ).length;
  const walletTotal = rows.reduce((s, r) => s + Number(r.wallet_balance ?? 0), 0);
  const newToday = rows.filter((r) => r.created_at?.slice(0, 10) === today).length;
  const pending = rows.filter((r) => r.status === "blocked" || r.subscription_status === "pending").length;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard title="Total Residents" value={rows.length} icon={Users} trend={8} onClick={() => onFilter?.("all")} />
      <StatCard title="Active Residents" value={active} icon={UserCheck} accent="green" onClick={() => onFilter?.("active")} />
      <StatCard title="Premium Subscribers" value={premium} icon={Crown} accent="gold" onClick={() => onFilter?.("premium")} />
      <StatCard title="Wallet Balance" value={`₹${walletTotal.toLocaleString("en-IN")}`} icon={Wallet} accent="blue" />
      <StatCard title="New Today" value={newToday} icon={UserPlus} accent="orange" trend={newToday > 0 ? 12 : 0} />
      <StatCard title="Pending Verification" value={pending} icon={Clock} accent="red" onClick={() => onFilter?.("pending")} />
    </section>
  );
}
