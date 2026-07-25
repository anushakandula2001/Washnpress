"use client";

import { CalendarClock, CheckCircle2, Package, RefreshCw, XCircle } from "lucide-react";

export function PickupTimeline({ data }: { data: Record<string, unknown> }) {
  const p = data.pickup as Record<string, unknown>;
  const order = data.order as Record<string, unknown> | null;

  const events: Array<{ icon: typeof CalendarClock; label: string; date: string }> = [];

  if (p.created_at) {
    events.push({ icon: CalendarClock, label: "Pickup created", date: String(p.created_at) });
  }
  if (p.status === "rescheduled" || p.updated_at) {
    events.push({
      icon: RefreshCw,
      label: `Status: ${String(p.status)}`,
      date: String(p.updated_at ?? p.scheduled_for),
    });
  }
  if (p.scheduled_for) {
    events.push({
      icon: CalendarClock,
      label: "Scheduled for pickup",
      date: String(p.scheduled_for),
    });
  }
  if (order?.created_at) {
    events.push({
      icon: Package,
      label: `Order ${order.order_code} created`,
      date: String(order.created_at),
    });
  }
  if (p.status === "completed") {
    events.push({
      icon: CheckCircle2,
      label: "Pickup completed",
      date: String(p.updated_at ?? p.scheduled_for),
    });
  }
  if (p.status === "cancelled") {
    events.push({
      icon: XCircle,
      label: "Pickup cancelled",
      date: String(p.updated_at ?? ""),
    });
  }
  if (order?.status === "Delivered") {
    events.push({
      icon: CheckCircle2,
      label: "Order delivered",
      date: String(order.updated_at ?? ""),
    });
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="relative space-y-0 pl-6">
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border" />
      {events.map((e, i) => {
        const Icon = e.icon;
        return (
          <div key={i} className="relative pb-6">
            <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="h-3 w-3 text-primary" />
            </div>
            <p className="text-sm font-medium">{e.label}</p>
            <p className="text-xs text-muted-foreground">
              {e.date ? new Date(e.date).toLocaleString() : "—"}
            </p>
          </div>
        );
      })}
      {events.length === 0 && <p className="text-sm text-muted-foreground">No timeline events</p>}
    </div>
  );
}
