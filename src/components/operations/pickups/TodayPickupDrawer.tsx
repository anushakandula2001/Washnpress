"use client";

import { readApiJson } from "@/frontend/api-client";

import * as React from "react";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OrderRow } from "@/components/admin/orders/types";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";

import { OverviewTab } from "./tabs/OverviewTab";
import { ItemsTab } from "./tabs/ItemsTab";
import { OperatorTab } from "./tabs/OperatorTab";
import { ResidentTab } from "./tabs/ResidentTab";
import { NotesTab } from "./tabs/NotesTab";
import { ActivityTab } from "./tabs/ActivityTab";

const TABS = [
  "overview",
  "items",
  "operator",
  "resident",
  "notes",
  "activity",
] as const;

export function TodayPickupDrawer({
  orderId,
  row,
  open,
  onOpenChange,
  initialTab = "overview",
  onRefreshList,
}: {
  orderId: string | null;
  row?: OrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
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
    void fetch(`/api/operations/orders?id=${encodeURIComponent(orderId)}`, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await readApiJson(res);
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
  const tickets = (data?.tickets as Array<Record<string, unknown>>) ?? [];
  const auditLogs = (data?.auditLogs as Array<Record<string, unknown>>) ?? [];

  const displayCode = String(order?.order_code ?? row?.order_code ?? "Order");
  const displayStatus = String(order?.status ?? row?.status ?? "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent width="560px" className="flex flex-col p-0">
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col p-6">
              <Skeleton className="mb-4 h-16 w-full" />
              <Skeleton className="mb-2 h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}
          {error && (
            <div className="flex flex-col gap-3 p-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button size="sm" variant="outline" onClick={loadDetail}>
                Retry
              </Button>
            </div>
          )}
          {!loading && !error && (order || row) && (
            <div className="flex flex-col p-6 h-full">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{displayCode}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {String(order?.resident_name ?? row?.resident_name ?? "")} ·{" "}
                    {String(order?.society_name ?? row?.society_name ?? "")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <OrderStatusBadge status={displayStatus} />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    loadDetail();
                    onRefreshList?.();
                  }}
                >
                  Refresh
                </Button>
              </div>

              <Tabs value={tab} onValueChange={setTab} className="flex-1">
                <TabsList className="mb-6 flex h-auto flex-wrap gap-1 bg-transparent p-0 border-b border-border/50 w-full justify-start rounded-none">
                  {TABS.map((t) => (
                    <TabsTrigger 
                      key={t} 
                      value={t} 
                      className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                    >
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="overview" className="mt-0 outline-none">
                  <OverviewTab order={order ?? {}} row={row ?? undefined} />
                </TabsContent>
                
                <TabsContent value="items" className="mt-0 outline-none">
                  <ItemsTab items={items} addons={addons} />
                </TabsContent>
                
                <TabsContent value="operator" className="mt-0 outline-none">
                  <OperatorTab order={order ?? {}} operators={operators} />
                </TabsContent>
                
                <TabsContent value="resident" className="mt-0 outline-none">
                  <ResidentTab order={order ?? {}} />
                </TabsContent>
                
                <TabsContent value="notes" className="mt-0 outline-none">
                  <NotesTab order={order ?? {}} tickets={tickets} />
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0 outline-none">
                  <ActivityTab events={events} auditLogs={auditLogs} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
