"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { ActionDropdown } from "./ActionDropdown";
import { formatUnit, type OrderRow } from "./types";

export function OrdersTable({
  rows,
  loading,
  selected,
  onSelect,
  onSelectAll,
  onRowClick,
  onAction,
}: {
  rows: OrderRow[];
  loading?: boolean;
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onRowClick: (row: OrderRow) => void;
  onAction: (action: string, row: OrderRow) => void;
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
        <table className="w-full min-w-[1400px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3">
                <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all" />
              </th>
              <th className="px-3 py-3">Order</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Resident</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Society</th>
              <th className="px-3 py-3">Unit</th>
              <th className="px-3 py-3">Operator</th>
              <th className="px-3 py-3">Garments</th>
              <th className="px-3 py-3">Scheduled</th>
              <th className="px-3 py-3">Created</th>
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
                    aria-label={`Select ${r.order_code}`}
                  />
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-primary">{r.order_code}</td>
                <td className="px-3 py-2.5">
                  <OrderStatusBadge status={r.status} />
                </td>
                <td className="px-3 py-2.5 font-medium">{r.resident_name}</td>
                <td className="px-3 py-2.5">+91 {r.resident_phone}</td>
                <td className="px-3 py-2.5 max-w-[180px] truncate" title={r.society_name}>
                  {r.society_name}
                </td>
                <td className="px-3 py-2.5">{formatUnit(r)}</td>
                <td className="px-3 py-2.5">
                  {r.operator_name ? (
                    <span title={r.operator_code ?? undefined}>
                      {r.operator_code ?? "—"} · {r.operator_name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {r.pickup_garment_count}
                  {r.delivered_garment_count != null ? ` / ${r.delivered_garment_count}` : ""}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {r.scheduled_for ? new Date(r.scheduled_for).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <ActionDropdown
                    onView={() => onAction("view", r)}
                    onTimeline={() => onAction("timeline", r)}
                    onResident={() => onAction("resident", r)}
                    onOperator={() => onAction("operator", r)}
                    onItems={() => onAction("items", r)}
                    onNotes={() => onAction("notes", r)}
                    onActivity={() => onAction("activity", r)}
                    onAssignOperator={() => onAction("assign", r)}
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
