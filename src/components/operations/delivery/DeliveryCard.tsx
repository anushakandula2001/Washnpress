import * as React from "react";
import { OrderRow, formatUnit } from "@/components/admin/orders/types";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, User, Shirt, Phone, Truck, Eye, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DeliveryCardProps {
  row: OrderRow;
  onClick: (row: OrderRow) => void;
  onComplete: (row: OrderRow) => void;
  isBusy?: boolean;
}

export function DeliveryCard({ row, onClick, onComplete, isBusy }: DeliveryCardProps) {
  const dateObj = row.scheduled_for ? new Date(row.scheduled_for) : null;
  const timeStr = dateObj ? dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—";
  
  // Dummy data for missing API fields
  const address = `${row.society_name}, ${formatUnit(row)}, Bengaluru`;
  const phone = row.resident_phone || "+919876543210";
  const operator = row.operator_name || "Ramesh K.";

  const isPendingDelivery = row.status === "READY_FOR_DELIVERY" || row.status === "Ready for Delivery";

  return (
    <div className={cn("bg-card border border-border rounded-[18px] p-4 hover:shadow-[0_6px_20px_rgb(0,0,0,0.05)] transition-all duration-200 flex flex-col h-full", isBusy && "opacity-50 pointer-events-none")}>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-bold text-foreground">{row.resident_name || "Resident"}</span>
          <span className="text-xs text-muted-foreground font-medium">#{row.order_code}</span>
        </div>
        <div className="mb-2">
          <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20">{row.status}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-y-1 text-xs">
          <div><span className="text-muted-foreground">Address: </span><span className="font-medium">{address}</span></div>
          <div><span className="text-muted-foreground">Time: </span><span className="font-medium">{timeStr}</span></div>
          <div><span className="text-muted-foreground">Operator: </span><span className="font-medium">{operator}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(row);
          }}
          className="flex justify-center items-center gap-1.5 rounded-xl bg-muted/60 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>
        {isPendingDelivery ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(row);
            }}
            disabled={isBusy}
            className="flex justify-center items-center gap-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors"
          >
            <Truck className="h-3.5 w-3.5" /> Start Delivery
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(row);
            }}
            disabled={isBusy}
            className="flex justify-center items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Delivered
          </button>
        )}
        <a
          href={`tel:${phone}`}
          className="flex justify-center items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" /> Call Resident
        </a>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center gap-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors"
        >
          <MapPin className="h-3.5 w-3.5" /> Navigate
        </a>
      </div>
    </div>
  );
}
