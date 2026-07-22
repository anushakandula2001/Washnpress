"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PickupFilters, OperatorOpt, SocietyOpt } from "./types";

export function PickupFilters({
  filters,
  societies,
  operators,
  onChange,
  onReset,
}: {
  filters: PickupFilters;
  societies: SocietyOpt[];
  operators: OperatorOpt[];
  onChange: (f: Partial<PickupFilters>) => void;
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
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {/* <input
          type="date"
          className={selectClass}
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          title="From date"
        />
        <input
          type="date"
          className={selectClass}
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          title="To date"
        /> */}
        <select
          className={selectClass}
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value })}
        >
          <option value="scheduled_desc">Scheduled (newest)</option>
          <option value="scheduled_asc">Scheduled (oldest)</option>
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
