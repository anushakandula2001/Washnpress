"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/admin/shared/Avatar";
import { StatusBadge } from "./StatusBadge";
import { ActionDropdown } from "./ActionDropdown";
import type { OperatorRow } from "./types";

export function OperatorTable({
  rows,
  loading,
  selected,
  onSelect,
  onSelectAll,
  onRowClick,
  onAction,
}: {
  rows: OperatorRow[];
  loading?: boolean;
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onRowClick: (row: OperatorRow) => void;
  onAction: (action: string, row: OperatorRow) => void;
}) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1500px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3">
                <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all" />
              </th>
              <th className="px-3 py-3">Avatar</th>
              <th className="px-3 py-3">Operator ID</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">City</th>
              <th className="px-3 py-3">Societies</th>
              <th className="px-3 py-3">Residents</th>
              <th className="px-3 py-3">Orders</th>
              <th className="px-3 py-3">Last Login</th>
              <th className="px-3 py-3">Joined</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-b border-border/60 transition-colors hover:bg-primary/5"
                onClick={() => onRowClick(r)}
              >
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(r.id)}
                    onCheckedChange={(c) => onSelect(r.id, c)}
                    aria-label={`Select ${r.full_name}`}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Avatar name={r.full_name} size="sm" />
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-primary">{r.operator_code ?? r.id.slice(0, 8)}</td>
                <td className="px-3 py-2.5 font-medium">{r.full_name}</td>
                <td className="px-3 py-2.5">+91 {r.phone}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.email ?? "—"}</td>
                <td className="px-3 py-2.5">{r.city ?? "—"}</td>
                <td className="px-3 py-2.5 max-w-[200px] truncate" title={r.societies.join(", ")}>
                  {r.societies.length ? r.societies.join(", ") : "—"}
                </td>
                <td className="px-3 py-2.5">{r.residents_count ?? 0}</td>
                <td className="px-3 py-2.5">{r.orders_managed ?? 0}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {r.last_login_at ? new Date(r.last_login_at).toLocaleDateString() : "Never"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {r.created_at || r.joined_at
                    ? new Date(String(r.created_at ?? r.joined_at)).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <ActionDropdown
                    onView={() => onAction("view", r)}
                    onEdit={() => onAction("edit", r)}
                    onSocieties={() => onAction("societies", r)}
                    onResidents={() => onAction("residents", r)}
                    onOrders={() => onAction("orders", r)}
                    onPerformance={() => onAction("performance", r)}
                    onNotifications={() => onAction("notifications", r)}
                    onAssignSociety={() => onAction("assign", r)}
                    onTransfer={() => onAction("transfer", r)}
                    onDeactivate={() => onAction("deactivate", r)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
