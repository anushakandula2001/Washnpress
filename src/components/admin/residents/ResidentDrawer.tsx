"use client";

import * as React from "react";
import { ResidentProfile } from "./ResidentProfile";
import { ResidentOrders } from "./ResidentOrders";
import { ResidentWallet } from "./ResidentWallet";
import { ResidentSubscription } from "./ResidentSubscription";
import { ResidentActivity } from "./ResidentActivity";
import { ResidentSupport } from "./ResidentSupport";
import { ResidentNotifications } from "./ResidentNotifications";
import { ResidentAIInsights } from "./ResidentAIInsights";
import { ResidentCharts } from "./ResidentCharts";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/admin/shared/Avatar";
import { StatusBadge } from "./StatusBadge";

export function ResidentDrawer({
  residentId,
  open,
  onOpenChange,
  initialTab = "profile",
}: {
  residentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadDetail = React.useCallback(() => {
    if (!residentId) return;
    setLoading(true);
    setError(null);
    void fetch(`/api/admin/residents?id=${residentId}`, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [residentId]);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab, residentId]);

  React.useEffect(() => {
    if (!open || !residentId) return;
    loadDetail();
  }, [open, residentId, loadDetail]);

  const resident = data?.resident as Record<string, unknown> | undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent width="520px">
        {loading && (
          <div className="flex h-full flex-col p-6">
            <Skeleton className="mb-4 h-16 w-full" />
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
        {error && <div className="p-6 text-sm text-destructive">{error}</div>}
        {!loading && !error && resident && data && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar name={String(resident.full_name)} size="lg" />
                <div>
                  <h2 className="text-lg font-semibold">{String(resident.full_name ?? "Resident")}</h2>
                  <p className="text-sm text-muted-foreground">{String(resident.resident_code ?? resident.id)}</p>
                  <StatusBadge status={String(resident.user_status ?? "active")} />
                </div>
              </div>
            </SheetHeader>
            <SheetBody className="pt-0">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-2">
                  {["profile", "orders", "wallet", "subscription", "addresses", "activity", "support", "notifications", "insights"].map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">
                      {t === "insights" ? "AI Insights" : t}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="profile"><ResidentProfile data={data} /></TabsContent>
                <TabsContent value="orders"><ResidentOrders data={data} /></TabsContent>
                <TabsContent value="wallet"><ResidentWallet data={data} residentId={residentId!} onRefresh={loadDetail} /></TabsContent>
                <TabsContent value="subscription"><ResidentSubscription data={data} /></TabsContent>
                <TabsContent value="addresses"><ResidentProfile data={data} showAddresses /></TabsContent>
                <TabsContent value="activity"><ResidentActivity data={data} /></TabsContent>
                <TabsContent value="support"><ResidentSupport data={data} /></TabsContent>
                <TabsContent value="notifications"><ResidentNotifications data={data} /></TabsContent>
                <TabsContent value="insights">
                  <ResidentAIInsights data={data} />
                  <ResidentCharts data={data} />
                </TabsContent>
              </Tabs>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
