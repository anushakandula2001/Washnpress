"use client";

import { readApiJson } from "@/frontend/api-client";

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
        const json = await readApiJson(res);
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
        {error && (
          <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Access Denied</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        )}
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
                  {["profile", "orders",  "subscription", "addresses", "activity", "support", "notifications", "insights"].map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">
                      {t === "insights" ? "AI Insights" : t}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="profile"><ResidentProfile data={data} /></TabsContent>
                <TabsContent value="orders"><ResidentOrders data={data} /></TabsContent>
            
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
