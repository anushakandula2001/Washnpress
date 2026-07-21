"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";
import type { OperatorFilters as OperatorFiltersType, SocietyOpt } from "./types";

export function OperatorFilters({
  filters,
  societies,
  onChange,
  onReset,
}: {
  filters: OperatorFiltersType;
  societies: SocietyOpt[];
  onChange: (f: Partial<OperatorFiltersType>) => void;
  onReset: () => void;
}) {
  const [cities, setCities] = useState<string[]>([]);

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  // Load cities dynamically
  useEffect(() => {
    fetch("/api/admin/operators/cities")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.cities) {
          setCities(data.cities);
        }
      })
      .catch((err) => console.error("Error loading cities:", err));
  }, []);

  return (
    <Card className="mb-6 border-border/60 shadow-sm bg-card">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-end">
          
          {/* Search Bar */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search ID, name, phone, city..."
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
            />
          </div>

          {/* Society Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.societyId}
              onChange={(e) => onChange({ societyId: e.target.value })}
            >
              <option value="">All Societies</option>
              <option value="__unassigned__">Unassigned Societies</option>
              {societies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.status}
              onChange={(e) => onChange({ status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.city}
              onChange={(e) => onChange({ city: e.target.value })}
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">A → Z</option>
              <option value="z-a">Z → A</option>
              <option value="residents">Most Residents Managed</option>
              <option value="orders">Most Orders Managed</option>
              <option value="societies">Most Societies Assigned</option>
              <option value="performance">Highest Performance</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={onReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
