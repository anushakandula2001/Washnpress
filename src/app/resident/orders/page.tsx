"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { OrderHorizontalStepper } from "@/components/resident/order-stepper";
import { OrderVerticalTimeline } from "@/components/resident/order-timeline";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderTrackingEvents } from "@/lib/resident-data";

function OrdersContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const { orders, selectedOrderId, setSelectedOrderId } = useResident();

  const activeId = highlightId ?? selectedOrderId;
  const activeOrder = orders.find((o) => o.id === activeId) ?? orders[0];
  const trackingEvents = orderTrackingEvents[activeOrder?.id] ?? [];

  return (
    <ResidentShell greeting="My Orders" subtitle="Track and manage your laundry orders">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={`w-full rounded-xl border bg-card p-4 text-left transition ${
                activeOrder?.id === order.id
                  ? "border-primary/50 shadow-sm"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    Placed: {order.placedDate} · {order.garments} items
                  </p>
                </div>
                <Badge variant={order.badgeVariant}>{order.displayStatus}</Badge>
              </div>
              {order.addons.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Add-ons: {order.addons.join(", ")}</p>
              )}
              <div className="mt-3">
                <OrderHorizontalStepper stages={order.stages} currentStage={order.currentStage} />
              </div>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Order #{activeOrder?.id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pickup: {activeOrder?.pickupDate} · {activeOrder?.pickupTime}
            </p>
          </CardHeader>
          <CardContent>
            <OrderVerticalTimeline events={trackingEvents} />
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm">Download Receipt</Button>
              <Button variant="outline" size="sm">Report Issue</Button>
              {activeOrder?.status !== "Delivered" && (
                <Button variant="outline" size="sm">Cancel Order</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ResidentShell>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
