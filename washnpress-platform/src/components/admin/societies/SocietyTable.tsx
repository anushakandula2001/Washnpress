"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { ActionDropdown } from "./ActionDropdown";
import type { SocietyRow } from "./types";

export function SocietyTable({
  rows,
  loading,
  selected,
  onSelect,
  onSelectAll,
  onRowClick,
  onAction,
}: {
  rows: SocietyRow[];
  loading?: boolean;
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onRowClick: (row: SocietyRow) => void;
  onAction: (action: string, row: SocietyRow) => void;
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
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3">
                <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all" />
              </th>
              <th className="px-3 py-3">Society</th>
              <th className="px-3 py-3">City</th>
              <th className="px-3 py-3">State</th>
              <th className="px-3 py-3">Pincode</th>
              <th className="px-3 py-3">Operator</th>
              <th className="px-3 py-3">Towers</th>
              <th className="px-3 py-3">Flats</th>
              <th className="px-3 py-3">Residents</th>
              <th className="px-3 py-3">Orders</th>
              <th className="px-3 py-3">Subs</th>
              <th className="px-3 py-3">Wallet</th>
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
                    aria-label={`Select ${r.name}`}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.address_line_1 ?? "—"}</p>
                </td>
                <td className="px-3 py-2.5">{r.city}</td>
                <td className="px-3 py-2.5">{r.state}</td>
                <td className="px-3 py-2.5">{r.pincode ?? "—"}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.assigned_operators ?? "Unassigned"}</td>
                <td className="px-3 py-2.5">{r.towers_count}</td>
                <td className="px-3 py-2.5">{r.flats_count}</td>
                <td className="px-3 py-2.5">{r.residents_count}</td>
                <td className="px-3 py-2.5">{r.orders_count}</td>
                <td className="px-3 py-2.5">{r.subscriptions_count}</td>
                <td className="px-3 py-2.5">₹{Number(r.wallet_revenue ?? 0).toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <ActionDropdown
                    onView={() => onAction("view", r)}
                    onEdit={() => onAction("edit", r)}
                    onAssignOperator={() => onAction("assign", r)}
                    onPickupSlots={() => onAction("slots", r)}
                    onResidents={() => onAction("residents", r)}
                    onOrders={() => onAction("orders", r)}
                    onDeactivate={() => onAction("deactivate", r)}
                    onComingSoon={() => onAction("coming_soon", r)}
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
