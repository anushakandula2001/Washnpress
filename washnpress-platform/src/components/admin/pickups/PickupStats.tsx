"use client";

import {
  CalendarClock,
  CalendarDays,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { PickupStats, PickupTab } from "./types";

export function PickupStats({
  stats,
  loading,
  onTabChange,
}: {
  stats: PickupStats | null;
  loading?: boolean;
  onTabChange?: (tab: PickupTab) => void;
}) {
  if (loading || !stats) {
    return (
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </section>
    );
  }

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Today's Pickups"
        value={stats.today}
        icon={CalendarClock}
        accent="primary"
        onClick={() => onTabChange?.("today")}
      />
      <StatCard
        title="Scheduled"
        value={stats.scheduled}
        icon={CalendarDays}
        accent="blue"
        onClick={() => onTabChange?.("scheduled")}
      />
      <StatCard
        title="Assigned"
        value={stats.assigned}
        icon={UserCheck}
        accent="green"
        onClick={() => onTabChange?.("assigned")}
      />
      <StatCard
        title="Completed"
        value={stats.completed}
        icon={CheckCircle2}
        accent="green"
        onClick={() => onTabChange?.("completed")}
      />
      <StatCard
        title="Missed"
        value={stats.missed}
        icon={AlertTriangle}
        accent="orange"
        onClick={() => onTabChange?.("missed")}
      />
      <StatCard title="Cancelled" value={stats.cancelled} icon={XCircle} accent="red" />
    </section>
  );
}
