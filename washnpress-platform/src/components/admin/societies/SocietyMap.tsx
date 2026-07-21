"use client";

import { MapPin, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import type { SocietyRow } from "./types";

export function SocietyMap({
  rows,
  loading,
  onRowClick,
}: {
  rows: SocietyRow[];
  loading?: boolean;
  onRowClick: (row: SocietyRow) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  const byCity = rows.reduce<Record<string, SocietyRow[]>>((acc, row) => {
    const city = row.city || "Unknown";
    if (!acc[city]) acc[city] = [];
    acc[city].push(row);
    return acc;
  }, {});

  const cities = Object.keys(byCity).sort((a, b) => a.localeCompare(b));

  if (cities.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center p-8 text-sm text-muted-foreground">
          No societies to display on map view.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cities.map((city) => {
        const societies = byCity[city];
        const totalResidents = societies.reduce((s, r) => s + r.residents_count, 0);
        const activeCount = societies.filter((s) => s.status === "active").length;

        return (
          <Card key={city} className="overflow-hidden">
            <CardHeader className="border-b border-border bg-gradient-to-br from-primary/5 to-transparent pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                {city}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {societies.length} societies · {activeCount} active · {totalResidents} residents
              </p>
            </CardHeader>
            <CardContent className="max-h-72 space-y-2 overflow-y-auto p-3">
              {societies.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-left text-sm transition hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => onRowClick(s)}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.state} · {s.residents_count} residents</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </button>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
