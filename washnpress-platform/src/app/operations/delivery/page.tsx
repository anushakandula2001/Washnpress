"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Truck, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type QueueItem = {
  order_code: string;
  status: string;
  pickup_garment_count: number;
  scheduled_for: string;
  unit_number: string;
  tower_block: string | null;
  society_name: string;
  resident_name: string;
};

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchDeliveries = () => {
    setLoading(true);
    fetch("/api/operations/queue", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        const deliveryStatuses = ["Ready for Delivery", "Out for Delivery"];
        setDeliveries(data.queue?.filter((q: QueueItem) => deliveryStatuses.includes(q.status)) || []);
      })
      .catch((err) => {
        console.error(err);
        toast("Failed to load deliveries", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleMarkDelivered = async (orderCode: string) => {
    if (submittingIds.has(orderCode)) return;
    
    setSubmittingIds(prev => new Set(prev).add(orderCode));
    try {
      const res = await fetch(`/api/operations/delivery/${orderCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Delivered' })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark delivered");
      
      toast(`Order ${orderCode} has been marked as delivered.`, "success");
      
      // Auto-refresh the queue
      fetchDeliveries();
    } catch (error) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
    } finally {
      setSubmittingIds(prev => {
        const next = new Set(prev);
        next.delete(orderCode);
        return next;
      });
    }
  };

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Delivery Management"
      subtitle="Orders ready for delivery and out for delivery"
    >
      <div className="mb-6 flex justify-end">
        <Button variant="outline" onClick={fetchDeliveries} className="gap-2 bg-background shadow-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
        </Button>
      </div>

      {loading && deliveries.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary/40" />
          Loading deliveries...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="py-20 text-center border rounded-xl border-dashed bg-card shadow-sm">
          <Truck className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Pending Deliveries</h3>
          <p className="text-sm text-muted-foreground">All orders are delivered or still in processing.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deliveries.map((p) => (
            <Card key={p.order_code} className="hover:border-primary/50 transition shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="pb-2 bg-muted/20 border-b border-border/40">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-bold text-primary">{p.order_code}</CardTitle>
                  <Badge variant={p.status === "Ready for Delivery" ? "secondary" : "default"} className="shadow-sm">
                    {p.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                  <Clock className="h-3 w-3" />
                  Scheduled Pickup: {new Date(p.scheduled_for).toLocaleString(undefined, {
                    month: "short", day: "numeric"
                  })}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{p.resident_name}</p>
                    <p className="text-xs text-muted-foreground">{p.pickup_garment_count} Garments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm pb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {p.unit_number}{p.tower_block ? `, ${p.tower_block}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.society_name}</p>
                  </div>
                </div>
                <div className="pt-2 mt-auto">
                   {p.status === "Ready for Delivery" ? (
                     <Button className="w-full text-xs shadow-sm font-medium" variant="secondary">
                       <Truck className="h-3 w-3 mr-2" /> Mark Out For Delivery
                     </Button>
                   ) : (
                     <Button 
                       className="w-full text-xs shadow-sm font-medium" 
                       variant="default"
                       onClick={() => handleMarkDelivered(p.order_code)}
                       disabled={submittingIds.has(p.order_code)}
                     >
                       {submittingIds.has(p.order_code) ? (
                         <><RefreshCw className="h-3 w-3 mr-2 animate-spin" /> Processing...</>
                       ) : (
                         <><CheckCircle className="h-3 w-3 mr-2" /> Mark Delivered</>
                       )}
                     </Button>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
