"use client";

import { Building2, MapPin, Users, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import type { SocietyRow } from "./types";

export function SocietyCards({
  rows,
  loading,
  selected,
  onSelect,
  onRowClick,
}: {
  rows: SocietyRow[];
  loading?: boolean;
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onRowClick: (row: SocietyRow) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((s) => (
        <Card
          key={s.id}
          className="group cursor-pointer transition hover:border-primary/40 hover:shadow-md"
          onClick={() => onRowClick(s)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={(c) => onSelect(s.id, c)}
                    aria-label={`Select ${s.name}`}
                  />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-primary" />
                    {s.name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {s.city}, {s.state} {s.pincode ?? ""}
                  </CardDescription>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="line-clamp-1">{s.address_line_1 ?? "No address on file"}</p>
            <p>Operator: <span className="text-foreground">{s.assigned_operators ?? "Unassigned"}</span></p>
            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.residents_count} residents</span>
              <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" />{s.orders_count} orders</span>
              <span>Towers {s.towers_count} · Flats {s.flats_count}</span>
            </div>
            <p className="text-xs">
              Subs {s.subscriptions_count} · Wallet ₹{Number(s.wallet_revenue ?? 0).toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
