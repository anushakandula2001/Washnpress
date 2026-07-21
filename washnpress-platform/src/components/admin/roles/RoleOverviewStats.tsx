"use client";

import {
  Users,
  UserCheck,
  Shield,
  Wrench,
  Home,
  UserX,
} from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRoleRow } from "./types";
import { primaryRole } from "./types";

export function RoleOverviewStats({
  users,
  loading,
  onFilter,
}: {
  users: UserRoleRow[];
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

  const active = users.filter((u) => u.status === "active").length;
  const admins = users.filter((u) => primaryRole(u.roles) === "admin").length;
  const operators = users.filter((u) => primaryRole(u.roles) === "operator").length;
  const residents = users.filter((u) => primaryRole(u.roles) === "resident").length;
  const inactive = users.filter((u) => u.status !== "active").length;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard title="Total Users" value={users.length} icon={Users} onClick={() => onFilter?.("all")} />
      <StatCard title="Active Users" value={active} icon={UserCheck} accent="green" onClick={() => onFilter?.("active")} />
      <StatCard title="Admins" value={admins} icon={Shield} accent="primary" onClick={() => onFilter?.("admin")} />
      <StatCard title="Operators" value={operators} icon={Wrench} accent="blue" onClick={() => onFilter?.("operator")} />
      <StatCard title="Residents" value={residents} icon={Home} accent="orange" onClick={() => onFilter?.("resident")} />
      <StatCard title="Inactive / Blocked" value={inactive} icon={UserX} accent="red" onClick={() => onFilter?.("inactive")} />
    </section>
  );
}
