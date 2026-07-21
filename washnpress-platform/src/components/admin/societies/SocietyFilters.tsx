"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";
import type { SocietyFilters, SocietyRow } from "./types";

export function SocietyFilters({
  filters,
  rows,
  onChange,
  onReset,
}: {
  filters: SocietyFilters;
  rows: SocietyRow[];
  onChange: (f: Partial<SocietyFilters>) => void;
  onReset: () => void;
}) {
  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  // Compute cities dynamically from rows
  const cities = useMemo(() => {
    return [...new Set(rows.map((r) => r.city).filter(Boolean))].sort();
  }, [rows]);

  // Compute states dynamically from rows
  const states = useMemo(() => {
    return [...new Set(rows.map((r) => r.state).filter(Boolean))].sort();
  }, [rows]);

  return (
    <Card className="mb-6 border-border/60 shadow-sm bg-card">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-end">
          
          {/* Search Bar */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search society, pincode, operator, resident..."
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
            />
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
              <option value="coming_soon">Upcoming</option>
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

          {/* State Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.state}
              onChange={(e) => onChange({ state: e.target.value })}
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-end">
          {/* Sort By Dropdown */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
              Sort By
            </label>
            <select
              className={selectClass}
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value })}
            >
              <option value="name">Name A → Z</option>
              <option value="name_desc">Name Z → A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="residents">Most Residents</option>
              <option value="orders">Most Orders</option>
              <option value="revenue">Highest Revenue</option>
              <option value="wallet">Highest Wallet</option>
            </select>
          </div>

          <div className="lg:col-span-3 flex justify-end">
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
        </div>
      </CardContent>
    </Card>
  );
}
