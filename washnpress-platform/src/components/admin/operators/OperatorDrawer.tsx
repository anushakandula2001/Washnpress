"use client";

import * as React from "react";
import { OperatorProfile } from "./OperatorProfile";
import { OperatorSocieties } from "./OperatorSocieties";
import { OperatorResidents } from "./OperatorResidents";
import { OperatorOrders } from "./OperatorOrders";
import { OperatorExecutives } from "./OperatorExecutives";
import { OperatorPerformance } from "./OperatorPerformance";
import { OperatorActivity } from "./OperatorActivity";
import { OperatorNotifications } from "./OperatorNotifications";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/admin/shared/Avatar";
import { StatusBadge } from "./StatusBadge";

const TABS = [
  "profile",
  "societies",
  "residents",
  "orders",
  "executives",
  "performance",
  "activity",
  "notifications",
] as const;

export function OperatorDrawer({
  operatorId,
  open,
  onOpenChange,
  initialTab = "profile",
  onAssignSociety,
  onTransfer,
  onRefreshList,
}: {
  operatorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
  onAssignSociety?: (operatorId: string) => void;
  onTransfer?: (operatorId: string) => void;
  onRefreshList?: () => void;
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [statusBusy, setStatusBusy] = React.useState(false);

  const loadDetail = React.useCallback(() => {
    if (!operatorId) return;
    setLoading(true);
    setError(null);
    void fetch(`/api/admin/operators?id=${operatorId}`, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [operatorId]);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab, operatorId]);

  React.useEffect(() => {
    if (!open || !operatorId) return;
    loadDetail();
  }, [open, operatorId, loadDetail]);

  async function toggleStatus() {
    if (!data?.operator) return;
    const op = data.operator as { id: string; status: string };
    const next = op.status === "active" ? "inactive" : "active";
    setStatusBusy(true);
    try {
      const res = await fetch("/api/admin/operators", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorId: op.id, status: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Update failed");
      loadDetail();
      onRefreshList?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setStatusBusy(false);
    }
  }

  const operator = data?.operator as Record<string, unknown> | undefined;

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
        {error && <div className="p-6 text-sm text-destructive">{error}</div>}
        {!loading && !error && operator && data && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={String(operator.full_name)} size="lg" />
                  <div>
                    <h2 className="text-lg font-semibold">{String(operator.full_name ?? "Operator")}</h2>
                    <p className="font-mono text-sm text-primary">{String(operator.operator_code ?? operator.id)}</p>
                    <StatusBadge status={String(operator.status ?? "active")} />
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={statusBusy} onClick={() => void toggleStatus()}>
                  {operator.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </SheetHeader>
            <SheetBody className="pt-0">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-2 flex h-auto flex-wrap gap-1">
                  {TABS.map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="profile">
                  <OperatorProfile data={data} />
                </TabsContent>
                <TabsContent value="societies">
                  <OperatorSocieties
                    data={data}
                    onAssign={() => operatorId && onAssignSociety?.(operatorId)}
                    onTransfer={() => operatorId && onTransfer?.(operatorId)}
                  />
                </TabsContent>
                <TabsContent value="residents">
                  <OperatorResidents data={data} />
                </TabsContent>
                <TabsContent value="orders">
                  <OperatorOrders data={data} />
                </TabsContent>
                <TabsContent value="executives">
                  <OperatorExecutives data={data} />
                </TabsContent>
                <TabsContent value="performance">
                  <OperatorPerformance data={data} />
                </TabsContent>
                <TabsContent value="activity">
                  <OperatorActivity data={data} />
                </TabsContent>
                <TabsContent value="notifications">
                  <OperatorNotifications data={data} />
                </TabsContent>
              </Tabs>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
