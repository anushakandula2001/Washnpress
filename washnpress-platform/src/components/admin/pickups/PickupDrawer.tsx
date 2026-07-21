"use client";

import * as React from "react";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PickupStatusBadge } from "./PickupStatusBadge";
import { PickupOverview } from "./PickupOverview";
import { PickupResidentTab } from "./PickupResidentTab";
import { PickupOperatorTab } from "./PickupOperatorTab";
import { PickupDetailsTab } from "./PickupDetailsTab";
import { PickupTimeline } from "./PickupTimeline";
import { PickupPhotos } from "./PickupPhotos";
import { PickupNotes } from "./PickupNotes";
import { PickupActivity } from "./PickupActivity";
import { CalendarClock } from "lucide-react";

const DRAWER_TABS = [
  { id: "overview", label: "Overview" },
  { id: "resident", label: "Resident" },
  { id: "operator", label: "Operator" },
  { id: "details", label: "Pickup Details" },
  { id: "timeline", label: "Timeline" },
  { id: "photos", label: "Photos" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activity" },
] as const;

export function PickupDrawer({
  pickupId,
  open,
  onOpenChange,
  initialTab = "overview",
  onAssignOperator,
  onRefreshList,
}: {
  pickupId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
  onAssignOperator?: (societyId: string, societyName: string) => void;
  onRefreshList?: () => void;
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [statusBusy, setStatusBusy] = React.useState(false);

  const loadDetail = React.useCallback(() => {
    if (!pickupId) return;
    setLoading(true);
    setError(null);
    void fetch(`/api/admin/pickups?id=${pickupId}`, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [pickupId]);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab, pickupId]);

  React.useEffect(() => {
    if (!open || !pickupId) return;
    loadDetail();
  }, [open, pickupId, loadDetail]);

  async function updateStatus(status: string) {
    if (!pickupId) return;
    setStatusBusy(true);
    try {
      const res = await fetch("/api/admin/pickups", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupId, status }),
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

  const pickup = data?.pickup as Record<string, unknown> | undefined;
  const status = String(pickup?.status ?? "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent width="580px">
        {loading && (
          <div className="flex h-full flex-col p-6">
            <Skeleton className="mb-4 h-16 w-full" />
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
        {error && <div className="p-6 text-sm text-destructive">{error}</div>}
        {!loading && !error && pickup && data && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <CalendarClock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {pickup.scheduled_for
                        ? new Date(String(pickup.scheduled_for)).toLocaleString()
                        : "Pickup"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {String(pickup.resident_name)} · {String(pickup.society_name)}
                    </p>
                    <PickupStatusBadge status={status} className="mt-1" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {status !== "completed" && status !== "cancelled" && (
                  <Button size="sm" disabled={statusBusy} onClick={() => void updateStatus("completed")}>
                    Mark Completed
                  </Button>
                )}
                {status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={statusBusy}
                    onClick={() => void updateStatus("cancelled")}
                  >
                    Cancel Pickup
                  </Button>
                )}
                {!pickup.operator_id && onAssignOperator && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      onAssignOperator(String(pickup.society_id), String(pickup.society_name))
                    }
                  >
                    Assign Operator
                  </Button>
                )}
              </div>
            </SheetHeader>
            <SheetBody className="pt-0">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-2">
                  {DRAWER_TABS.map((t) => (
                    <TabsTrigger key={t.id} value={t.id}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="overview">
                  <PickupOverview data={data} />
                </TabsContent>
                <TabsContent value="resident">
                  <PickupResidentTab data={data} />
                </TabsContent>
                <TabsContent value="operator">
                  <PickupOperatorTab
                    data={data}
                    onAssignOperator={
                      onAssignOperator
                        ? () =>
                            onAssignOperator(String(pickup.society_id), String(pickup.society_name))
                        : undefined
                    }
                  />
                </TabsContent>
                <TabsContent value="details">
                  <PickupDetailsTab data={data} />
                </TabsContent>
                <TabsContent value="timeline">
                  <PickupTimeline data={data} />
                </TabsContent>
                <TabsContent value="photos">
                  <PickupPhotos />
                </TabsContent>
                <TabsContent value="notes">
                  <PickupNotes
                    pickupId={pickupId!}
                    instructions={pickup.special_instructions ? String(pickup.special_instructions) : null}
                    onSaved={loadDetail}
                  />
                </TabsContent>
                <TabsContent value="activity">
                  <PickupActivity data={data} />
                </TabsContent>
              </Tabs>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
