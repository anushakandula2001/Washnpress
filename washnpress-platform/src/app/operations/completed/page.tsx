"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, User, Package } from "lucide-react";

type CompletedItem = {
  order_code: string;
  status: string;
  pickup_garment_count: number;
  completed_at: string;
  unit_number: string;
  tower_block: string | null;
  society_name: string;
  resident_name: string;
};

export default function CompletedOrdersPage() {
  const [orders, setOrders] = useState<CompletedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operations/completed", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => setOrders(data.completed || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Completed Orders"
      subtitle="Recently delivered and finished orders"
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading completed orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center border rounded-xl border-dashed">
          <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Completed Orders</h3>
          <p className="text-sm text-muted-foreground">No orders have been marked as delivered yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => (
            <Card key={o.order_code} className="hover:border-primary/50 transition">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-bold">{o.order_code}</CardTitle>
                  <Badge variant="success">
                    {o.status}
                  </Badge>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Delivered on {new Date(o.completed_at).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                  })}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm border-t pt-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{o.resident_name}</p>
                    <p className="text-xs text-muted-foreground">{o.pickup_garment_count} Garments Processed</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm border-t pt-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {o.unit_number}{o.tower_block ? `, ${o.tower_block}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{o.society_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
