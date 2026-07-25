"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { OrderHorizontalStepper } from "@/components/resident/order-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrackingEvent } from "@/lib/resident-data";

export default function TrackOrderPage() {
  const { selectedOrder, orders, setSelectedOrderId, getOrderTracking } = useResident();
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    if (!selectedOrder?.id) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    void getOrderTracking(selectedOrder.id).then((data) => {
      if (!cancelled) setEvents(data);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedOrder?.id, getOrderTracking]);

  return (
    <ResidentShell
      greeting="Track Order"
      subtitle="Live progress from pickup through delivery (read-only)"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {orders.map((o) => (
          <Button
            key={o.id}
            size="sm"
            variant={selectedOrder?.id === o.id ? "default" : "outline"}
            onClick={() => setSelectedOrderId(o.id)}
          >
            {o.id}
          </Button>
        ))}
      </div>

      {selectedOrder ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{selectedOrder.id}</CardTitle>
              <Badge variant={selectedOrder.badgeVariant}>{selectedOrder.displayStatus}</Badge>
            </div>
            <CardDescription>
              Resident portal is read-only for status. Updates come from Operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <OrderHorizontalStepper
              stages={selectedOrder.stages}
              currentStage={selectedOrder.currentStage}
            />
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.stage} className="rounded-xl border border-border p-3 text-sm">
                  <p className="font-medium">{e.label}</p>
                  <p className="text-muted-foreground">
                    {e.timestamp ?? (e.active ? "In progress" : "Pending")}
                  </p>
                </li>
              ))}
            </ul>
            <Link href="/resident/orders" className="text-sm text-primary no-underline hover:underline">
              Back to My Orders
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No order selected.
          </CardContent>
        </Card>
      )}
    </ResidentShell>
  );
}
