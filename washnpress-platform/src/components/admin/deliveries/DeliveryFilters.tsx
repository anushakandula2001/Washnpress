"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DeliveryFilters, OperatorOpt, SocietyOpt } from "./types";

export function DeliveryFilters({
  filters,
  societies,
  operators,
  onChange,
  onReset,
}: {
  filters: DeliveryFilters;
  societies: SocietyOpt[];
  operators: OperatorOpt[];
  onChange: (f: Partial<DeliveryFilters>) => void;
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
              {o.operator_code ?? o.full_name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={selectClass}
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          title="Scheduled from"
        />
        <input
          type="date"
          className={selectClass}
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          title="Scheduled to"
        />
        <select className={selectClass} value={filters.sortBy} onChange={(e) => onChange({ sortBy: e.target.value })}>
          <option value="newest">Newest Updated</option>
          <option value="oldest">Oldest Updated</option>
          <option value="scheduled">Scheduled Soon</option>
          <option value="garments">Most Garments</option>
          <option value="resident">Resident A-Z</option>
        </select>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}
