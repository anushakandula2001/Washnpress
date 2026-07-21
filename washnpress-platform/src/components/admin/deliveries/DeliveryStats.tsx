"use client";

import { Package, Truck, CheckCircle2, AlertTriangle, Clock, Users } from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeliveryRow, DeliveryTab } from "./types";

function isReady(status: string) {
  const s = status.toLowerCase();
  return s.includes("ready") || s === "packing" || s === "packed";
}

function isOut(status: string) {
  return status.toLowerCase().includes("out for delivery");
}

function isDelivered(status: string) {
  return status.toLowerCase() === "delivered";
}

function isFailed(status: string) {
  const s = status.toLowerCase();
  return s.includes("failed");
}

export function DeliveryStats({
  rows,
  loading,
  onTabChange,
}: {
  rows: DeliveryRow[];
  loading?: boolean;
  onTabChange?: (tab: DeliveryTab) => void;
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

  const ready = rows.filter((r) => isReady(r.status)).length;
  const out = rows.filter((r) => isOut(r.status)).length;
  const delivered = rows.filter((r) => isDelivered(r.status)).length;
  const failed = rows.filter((r) => isFailed(r.status)).length;
  const unassigned = rows.filter((r) => !r.operator_id && !isDelivered(r.status) && !isFailed(r.status)).length;
  const garments = rows.reduce((s, r) => s + (r.pickup_garment_count ?? 0), 0);

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard title="Ready" value={ready} icon={Package} accent="orange" onClick={() => onTabChange?.("ready")} />
      <StatCard title="Out for Delivery" value={out} icon={Truck} accent="blue" onClick={() => onTabChange?.("out")} />
      <StatCard title="Delivered" value={delivered} icon={CheckCircle2} accent="green" onClick={() => onTabChange?.("delivered")} />
      <StatCard title="Failed" value={failed} icon={AlertTriangle} accent="red" onClick={() => onTabChange?.("failed")} />
      <StatCard title="Unassigned" value={unassigned} icon={Users} accent="gold" />
      <StatCard title="Garments in Pipeline" value={garments} icon={Clock} accent="primary" />
    </section>
  );
}
