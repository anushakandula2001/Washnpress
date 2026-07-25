"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PickupStatusBadge } from "./PickupStatusBadge";
import { CalendarClock, MapPin, Package, Repeat, User } from "lucide-react";

export function PickupOverview({ data }: { data: Record<string, unknown> }) {
  const p = data.pickup as Record<string, unknown>;
  const order = data.order as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pickup Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="font-medium">
                {p.scheduled_for ? new Date(String(p.scheduled_for)).toLocaleString() : "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <PickupStatusBadge status={String(p.status ?? "")} />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Society</p>
              <p className="font-medium">{String(p.society_name ?? "—")}</p>
              <p className="text-xs text-muted-foreground">
                {[p.tower_block, p.unit_number].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Resident</p>
              <p className="font-medium">{String(p.resident_name ?? "—")}</p>
              <p className="text-xs text-muted-foreground">+91 {String(p.phone ?? "")}</p>
            </div>
          </div>
          {order && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Linked Order</p>
                <p className="font-mono text-sm text-primary">{String(order.order_code)}</p>
                <p className="text-xs text-muted-foreground">{String(order.status)}</p>
              </div>
            </div>
          )}
          {Boolean(p.recurring) ? (
            <div className="flex items-center gap-2 sm:col-span-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">
                Recurring pickup{p.recurring_day ? ` · ${String(p.recurring_day)}` : ""}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
