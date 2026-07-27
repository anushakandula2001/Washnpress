"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PickupDetailsTab({ data }: { data: Record<string, unknown> }) {
  const p = data.pickup as Record<string, unknown>;
  const order = data.order as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pickup Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Pickup ID</p>
            <p className="font-mono text-xs">{String(p.id)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time Slot</p>
            <p>
              {p.slot_window ? String(p.slot_window) : "—"}
              {p.start_time && p.end_time
                ? ` (${String(p.start_time).slice(0, 5)}–${String(p.end_time).slice(0, 5)})`
                : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recurring</p>
            <p>{p.recurring ? `Yes${p.recurring_day ? ` · ${String(p.recurring_day)}` : ""}` : "No"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Society</p>
            <p>{String(p.society_name ?? "—")}</p>
            {p.society_city != null && p.society_city !== "" ? (
              <p className="text-xs text-muted-foreground">{String(p.society_city)}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Special Instructions</p>
            <p className="whitespace-pre-wrap">{String(p.special_instructions ?? "None")}</p>
          </div>
        </CardContent>
      </Card>

      {order && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Order Code</p>
              <p className="font-mono text-primary">{String(order.order_code)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p>{String(order.status)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Garments Picked</p>
              <p>{String(order.pickup_garment_count ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">QC Status</p>
              <p>{String(order.qc_status ?? "—")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
