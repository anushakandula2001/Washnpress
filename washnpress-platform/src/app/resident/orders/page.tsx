"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { OrderHorizontalStepper } from "@/components/resident/order-stepper";
import { OrderVerticalTimeline } from "@/components/resident/order-timeline";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { TrackingEvent } from "@/lib/resident-data";

type FilterTab = "all" | "active" | "completed" | "cancelled";
type SortKey = "newest" | "oldest";

const PAGE_SIZE = 8;

function isActiveStatus(status: string) {
  return status !== "Delivered" && status !== "Cancelled";
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const { orders, selectedOrderId, setSelectedOrderId, getOrderTracking } = useResident();

  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...orders];

    if (tab === "active") list = list.filter((o) => isActiveStatus(o.status));
    if (tab === "completed") list = list.filter((o) => o.status === "Delivered");
    if (tab === "cancelled") list = list.filter((o) => o.status === "Cancelled");

    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.displayStatus.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      const da = a.placedDate.localeCompare(b.placedDate);
      return sort === "newest" ? -da : da;
    });

    return list;
  }, [orders, tab, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [tab, query, sort]);

  const activeId = highlightId ?? selectedOrderId;
  const activeOrder =
    filtered.find((o) => o.id === activeId) ??
    pageItems.find((o) => o.id === activeId) ??
    pageItems[0] ??
    filtered[0];

  useEffect(() => {
    if (activeOrder?.id) setSelectedOrderId(activeOrder.id);
  }, [activeOrder?.id, setSelectedOrderId]);

  useEffect(() => {
    if (!activeOrder?.id) {
      setTrackingEvents([]);
      return;
    }
    let cancelled = false;
    void getOrderTracking(activeOrder.id).then((events) => {
      if (!cancelled) setTrackingEvents(events);
    });
    return () => {
      cancelled = true;
    };
  }, [activeOrder?.id, getOrderTracking]);

  const tabs: Array<{ id: FilterTab; label: string }> = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <ResidentShell greeting="My Orders" subtitle="Track and manage your laundry orders">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={tab === t.id ? "default" : "outline"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order id or status"
            className="w-full sm:w-64"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
          >
            Sort: {sort === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          {pageItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No orders match this filter.
              </CardContent>
            </Card>
          ) : (
            pageItems.map((order) => (
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add-ons: {order.addons.join(", ")}
                  </p>
                )}
                <div className="mt-3">
                  <OrderHorizontalStepper stages={order.stages} currentStage={order.currentStage} />
                </div>
              </button>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {activeOrder ? `Order #${activeOrder.id}` : "Order details"}
            </CardTitle>
            {activeOrder && (
              <p className="text-sm text-muted-foreground">
                Pickup: {activeOrder.pickupDate} · {activeOrder.pickupTime}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {activeOrder ? (
              <>
                <OrderVerticalTimeline events={trackingEvents} />
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm">
                    Download Receipt
                  </Button>
                  <Button variant="outline" size="sm">
                    Report Issue
                  </Button>
                  {activeOrder.status !== "Delivered" && (
                    <Button variant="outline" size="sm">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select an order to view tracking.</p>
            )}
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
