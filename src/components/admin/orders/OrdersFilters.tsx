"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderFilters, OperatorOpt, SocietyOpt } from "./types";

export function OrdersFilters({
  filters,
  societies,
  operators,
  onChange,
  onReset,
}: {
  filters: OrderFilters;
  societies: SocietyOpt[];
  operators: OperatorOpt[];
  onChange: (f: Partial<OrderFilters>) => void;
  onReset: () => void;
}) {
  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

  return (
    <Card className="mb-4">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <select
          className={selectClass}
          value={filters.societyId}
          onChange={(e) => onChange({ societyId: e.target.value })}
        >
          <option value="">All Societies</option>
          {societies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.operatorId}
          onChange={(e) => onChange({ operatorId: e.target.value })}
        >
          <option value="">All Operators</option>
          {operators.map((o) => (
            <option key={o.id} value={o.id}>
              {o.operator_code ?? "—"} · {o.full_name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
        >
          <option value="">Any Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Picked Up">Picked Up</option>
          <option value="In Wash">In Wash</option>
          <option value="Dry">Dry</option>
          <option value="Iron">Iron</option>
          <option value="QC Hold">QC Hold</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select className={selectClass} value={filters.sortBy} onChange={(e) => onChange({ sortBy: e.target.value })}>
          <option value="">Sort By</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="scheduled">Scheduled Date</option>
        </select>

      </CardContent>
    </Card>
  );
}
