import * as React from "react";
import { OrderRow, formatUnit } from "@/components/admin/orders/types";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, User, CheckCircle, Smartphone, MapPin, Truck } from "lucide-react";

export function OverviewTab({
  order,
  row,
}: {
  order: Record<string, unknown>;
  row?: OrderRow;
}) {
  const code = String(order.order_code ?? row?.order_code ?? "—");
  const status = String(order.status ?? row?.status ?? "—");
  const scheduledFor = order.scheduled_for ?? row?.scheduled_for;
  const dateObj = scheduledFor ? new Date(String(scheduledFor)) : null;
  
  const dateStr = dateObj ? dateObj.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "—";
  const timeStr = dateObj ? dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-4 pb-8">
      {/* Order Info Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Order Information
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border/50">
            <div className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</span>
              <p className="font-medium">{code}</p>
            </div>
            <div className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
              <p className="font-medium">{status}</p>
            </div>
            <div className="p-4 space-y-1 border-t border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Pickup Date</span>
              <p className="font-medium">{dateStr}</p>
            </div>
            <div className="p-4 space-y-1 border-t border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Pickup Time</span>
              <p className="font-medium">{timeStr}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resident Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Resident
          </h3>
        </div>
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              Name
            </span>
            <p className="font-medium">{String(order.resident_name ?? row?.resident_name ?? "—")}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> Phone
            </span>
            <p className="font-medium">{String(order.resident_phone ?? row?.resident_phone ?? "—")}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              Society
            </span>
            <p className="font-medium">{String(order.society_name ?? row?.society_name ?? "—")}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Unit
            </span>
            <p className="font-medium">
              {formatUnit({
                tower_block: order.tower_block ? String(order.tower_block) : row?.tower_block,
                unit_number: order.unit_number ? String(order.unit_number) : row?.unit_number,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Operator Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Operator
          </h3>
        </div>
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              Name
            </span>
            <p className="font-medium">{String(order.operator_name ?? row?.operator_name ?? "Unassigned")}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> Phone
            </span>
            <p className="font-medium">{String(order.operator_phone ?? row?.operator_phone ?? "—")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Pickup Details
          </h3>
        </div>
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Created At</span>
            <p className="font-medium">
              {order.created_at ? new Date(String(order.created_at)).toLocaleString() : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Last Updated</span>
            <p className="font-medium">
              {order.updated_at ? new Date(String(order.updated_at)).toLocaleString() : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
