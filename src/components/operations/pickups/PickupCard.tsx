import * as React from "react";
import { OrderRow, formatUnit } from "@/components/admin/orders/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, User, Shirt, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PickupCardProps {
  row: OrderRow;
  onClick: (row: OrderRow) => void;
  onComplete: (row: OrderRow) => void;
  isBusy?: boolean;
}

export function PickupCard({ row, onClick, onComplete, isBusy }: PickupCardProps) {
  const dateObj = row.scheduled_for ? new Date(row.scheduled_for) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
  const timeStr = dateObj ? dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—";
  
  return (
    <Card 
      className={cn("group overflow-hidden transition-all hover:shadow-md cursor-pointer border-border/50 flex flex-col h-full", isBusy && "opacity-50 pointer-events-none")}
      onClick={() => onClick(row)}
    >
      <div className="flex justify-between items-start p-4 bg-muted/20 border-b border-border/50">
        <div>
          <h3 className="font-semibold text-lg">{row.order_code}</h3>
          <Badge variant="outline" className="mt-1 bg-background">
            {row.status}
          </Badge>
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm font-medium text-foreground gap-1.5 justify-end">
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
            {dateStr}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {timeStr}
          </div>
        </div>
      </div>

      <CardContent className="p-4 flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <User className="w-4 h-4" />
              <span>Resident</span>
            </div>
            <p className="font-medium truncate">{row.resident_name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </div>
            <p className="font-medium truncate">{row.society_name}</p>
            <p className="text-xs text-muted-foreground">{formatUnit(row)}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Shirt className="w-4 h-4" />
              <span>Items</span>
            </div>
            <p className="font-medium">{row.pickup_garment_count} Garments</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Operator</span>
            </div>
            <p className="font-medium truncate">{row.operator_name || "Unassigned"}</p>
            {row.operator_code && <p className="text-xs text-muted-foreground">{row.operator_code}</p>}
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 mt-auto flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onClick(row);
          }}
        >
          View Details
        </Button>
        <Button 
          className="flex-1"
          disabled={isBusy}
          onClick={(e) => {
            e.stopPropagation();
            onComplete(row);
          }}
        >
          Complete Pickup
        </Button>
      </div>
    </Card>
  );
}
