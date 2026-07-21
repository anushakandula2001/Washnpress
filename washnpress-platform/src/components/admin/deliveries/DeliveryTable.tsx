"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { ActionDropdown } from "./ActionDropdown";
import type { DeliveryRow } from "./types";

function formatUnit(row: DeliveryRow) {
  const parts = [row.tower_block, row.unit_number].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

export function DeliveryTable({
  rows,
  loading,
  selected,
  onSelect,
  onSelectAll,
  onRowClick,
  onAction,
}: {
  rows: DeliveryRow[];
  loading?: boolean;
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onRowClick: (row: DeliveryRow) => void;
  onAction: (action: string, row: DeliveryRow) => void;
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
              <th className="px-3 py-3">Resident</th>
              <th className="px-3 py-3">Society / Unit</th>
              <th className="px-3 py-3">Operator</th>
              <th className="px-3 py-3">Garments</th>
              <th className="px-3 py-3">Scheduled</th>
              <th className="px-3 py-3">Updated</th>
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
                    aria-label={`Select ${r.order_code}`}
                  />
                </td>
                <td className="px-3 py-2.5 font-mono text-primary">{r.order_code}</td>
                <td className="px-3 py-2.5">
                  <p className="font-medium">{r.resident_name}</p>
                  <p className="text-xs text-muted-foreground">+91 {r.phone}</p>
                </td>
                <td className="px-3 py-2.5">
                  <p>{r.society_name}</p>
                  <p className="text-xs text-muted-foreground">{formatUnit(r)}</p>
                </td>
                <td className="px-3 py-2.5">
                  {r.operator_name ? (
                    <>
                      <p>{r.operator_name}</p>
                      <p className="text-xs text-muted-foreground">{r.operator_code ?? "—"}</p>
                    </>
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
                  {r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <DeliveryStatusBadge status={r.status} />
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <ActionDropdown
                    onView={() => onAction("view", r)}
                    onAssign={() => onAction("assign", r)}
                    onReschedule={() => onAction("reschedule", r)}
                    onResident={() => onAction("resident", r)}
                    onOperator={() => onAction("operator", r)}
                    onTimeline={() => onAction("timeline", r)}
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
