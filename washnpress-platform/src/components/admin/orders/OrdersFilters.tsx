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
        {/* <input
          type="date"
          className={selectClass}
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          title="Created from"
        />
        <input
          type="date"
          className={selectClass}
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          title="Created to"
        /> */}
        <select className={selectClass} value={filters.sortBy} onChange={(e) => onChange({ sortBy: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="scheduled">Scheduled Date</option>
          <option value="garments">Most Garments</option>
          <option value="resident">Resident A-Z</option>
          <option value="society">Society A-Z</option>
        </select>
        {/* <div className="flex gap-2 sm:col-span-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onReset}>
            Reset Filters
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}
