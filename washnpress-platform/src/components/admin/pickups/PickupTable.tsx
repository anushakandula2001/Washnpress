"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/admin/shared/Avatar";
import { PickupStatusBadge } from "./PickupStatusBadge";
import type { PickupRow } from "./types";
import { CalendarClock, MapPin, Package, User } from "lucide-react";

function formatSlot(row: PickupRow) {
  if (!row.slot_window && !row.start_time) return "—";
  const times =
    row.start_time && row.end_time
      ? ` (${row.start_time.slice(0, 5)}–${row.end_time.slice(0, 5)})`
      : "";
  return `${row.slot_window ?? "Custom"}${times}`;
}

function formatUnit(row: PickupRow) {
  const parts = [row.tower_block, row.unit_number].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

export function PickupTable({
  rows,
  loading,
  onRowClick,
}: {
  rows: PickupRow[];
  loading?: boolean;
  onRowClick: (row: PickupRow) => void;
}) {
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
              <th className="px-3 py-3">Scheduled</th>
              <th className="px-3 py-3">Resident</th>
              <th className="px-3 py-3">Society / Unit</th>
              <th className="px-3 py-3">Slot</th>
              <th className="px-3 py-3">Order</th>
              <th className="px-3 py-3">Operator</th>
              <th className="px-3 py-3">Garments</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-b border-border/60 transition-colors hover:bg-primary/5"
                onClick={() => onRowClick(r)}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{new Date(r.scheduled_for).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.resident_name} size="sm" />
                    <div>
                      <p className="font-medium">{r.resident_name}</p>
                      <p className="text-xs text-muted-foreground">+91 {r.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p>{r.society_name}</p>
                      <p className="text-xs text-muted-foreground">{formatUnit(r)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{formatSlot(r)}</td>
                <td className="px-3 py-2.5">
                  {r.order_code ? (
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="font-mono text-xs text-primary">{r.order_code}</p>
                        {r.order_status && <p className="text-xs text-muted-foreground">{r.order_status}</p>}
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {r.operator_name ? (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{r.operator_name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{r.operator_code ?? "—"}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400">Unassigned</span>
                  )}
                </td>
                <td className="px-3 py-2.5">{r.pickup_garment_count ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <PickupStatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
