"use client";

import * as React from "react";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderOverview } from "./OrderOverview";
import { OrderTimeline } from "./OrderTimeline";
import { OrderItems } from "./OrderItems";
import { OrderOperator } from "./OrderOperator";
import { OrderResident } from "./OrderResident";
import { OrderPayments } from "./OrderPayments";
import { OrderNotes } from "./OrderNotes";
import { OrderActivity } from "./OrderActivity";
import type { OrderRow } from "./types";

const TABS = [
  "overview",
  "timeline",
  "items",
  "operator",
  "resident",
  "payments",
  "notes",
  "activity",
] as const;

export function OrderDrawer({
  orderId,
  row,
  open,
  onOpenChange,
  initialTab = "overview",
  onAssignOperator,
  onRefreshList,
}: {
  orderId: string | null;
  row?: OrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
  onAssignOperator?: (row: OrderRow) => void;
  onRefreshList?: () => void;
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadDetail = React.useCallback(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    void fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [orderId]);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab, orderId]);

  React.useEffect(() => {
    if (!open || !orderId) return;
    loadDetail();
  }, [open, orderId, loadDetail]);

  const order = (data?.order as Record<string, unknown> | undefined) ?? undefined;
  const events = (data?.events as Array<Record<string, unknown>>) ?? [];
  const items = (data?.items as Array<Record<string, unknown>>) ?? [];
  const operators = (data?.operators as Array<Record<string, unknown>>) ?? [];
  const addons = (data?.addons as Array<Record<string, unknown>>) ?? [];
  const refunds = (data?.refunds as Array<Record<string, unknown>>) ?? [];
  const payments = (data?.payments as Array<Record<string, unknown>>) ?? [];
  const tickets = (data?.tickets as Array<Record<string, unknown>>) ?? [];
  const auditLogs = (data?.auditLogs as Array<Record<string, unknown>>) ?? [];

  const displayCode = String(order?.order_code ?? row?.order_code ?? "Order");
  const displayStatus = String(order?.status ?? row?.status ?? "");

  function handleAssign() {
    if (row && onAssignOperator) onAssignOperator(row);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent width="560px">
        {loading && (
          <div className="flex h-full flex-col p-6">
            <Skeleton className="mb-4 h-16 w-full" />
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
        {error && (
          <div className="flex h-full flex-col gap-3 p-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={loadDetail}>
              Retry
            </Button>
          </div>
        )}
        {!loading && !error && (order || row) && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{displayCode}</h2>
                  <p className="text-sm text-muted-foreground">
                    {String(order?.resident_name ?? row?.resident_name ?? "")} ·{" "}
                    {String(order?.society_name ?? row?.society_name ?? "")}
                  </p>
                  <div className="mt-2">
                    <OrderStatusBadge status={displayStatus} />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    loadDetail();
                    onRefreshList?.();
                  }}
                >
                  Refresh
                </Button>
              </div>
            </SheetHeader>
            <SheetBody>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4 flex h-auto flex-wrap gap-1">
                  {TABS.map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="overview">
                  <OrderOverview order={order ?? {}} row={row ?? undefined} />
                </TabsContent>
                <TabsContent value="timeline">
                  <OrderTimeline events={events} />
                </TabsContent>
                <TabsContent value="items">
                  <OrderItems items={items} addons={addons} />
                </TabsContent>
                <TabsContent value="operator">
                  <OrderOperator order={order ?? {}} operators={operators} onAssign={handleAssign} />
                </TabsContent>
                <TabsContent value="resident">
                  <OrderResident order={order ?? {}} />
                </TabsContent>
                <TabsContent value="payments">
                  <OrderPayments payments={payments} refunds={refunds} />
                </TabsContent>
                <TabsContent value="notes">
                  <OrderNotes order={order ?? {}} tickets={tickets} />
                </TabsContent>
                <TabsContent value="activity">
                  <OrderActivity events={events} auditLogs={auditLogs} />
                </TabsContent>
              </Tabs>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
