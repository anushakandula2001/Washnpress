"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalShell } from "@/components/portal/portal-shell";
import { api } from "@/frontend/api-client";
import { operationsNav } from "@/lib/portal-nav";
import { cn } from "@/lib/utils/cn";

export type QueueOrder = {
  id: string;
  resident: string;
  flat: string;
  garments: number;
  currentStatus: string;
  nextAction: string;
  nextStatus: string;
};

type OperationsQueuePageProps = {
  title: string;
  description: string;
  stageLabel: string;
  filterStatuses: string[];
  nextByStatus: Record<string, { status: string; label: string }>;
};

function mapQueueRow(
  row: Record<string, unknown>,
  nextByStatus: Record<string, { status: string; label: string }>,
): QueueOrder | null {
  const status = String(row.status ?? "");
  const next = nextByStatus[status];
  if (!next) return null;
  const flatParts = [row.tower_block, row.unit_number].filter(Boolean);
  return {
    id: String(row.order_code),
    resident: String(row.resident_name ?? "Resident"),
    flat: flatParts.length ? flatParts.join("-") : "—",
    garments: Number(row.pickup_garment_count ?? 0),
    currentStatus: status,
    nextAction: next.label,
    nextStatus: next.status,
  };
}

export function OperationsQueuePage({
  title,
  description,
  stageLabel,
  filterStatuses,
  nextByStatus,
}: OperationsQueuePageProps) {
  const [orders, setOrders] = useState<QueueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => filterStatuses.join("|"), [filterStatuses]);

  async function loadQueue() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.operations.queue();
      const mapped = data.queue
        .filter((row) => filterStatuses.includes(String(row.status)))
        .map((row) => mapQueueRow(row, nextByStatus))
        .filter((o): o is QueueOrder => o !== null);
      setOrders(mapped);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filter set changes
  }, [filterKey]);

  async function advance(id: string) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setBusyId(id);
    setError(null);
    try {
      await api.operations.updateStatus(order.id, order.nextStatus);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setToast(`${order.id}: ${order.nextAction}`);
      window.setTimeout(() => setToast(null), 2800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting={title}
      subtitle={description}
    >
      {toast && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {toast}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge>{stageLabel}</Badge>
        <Badge variant="secondary">{orders.length} in queue</Badge>
        <Button variant="outline" size="sm" onClick={() => void loadQueue()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Loading queue…
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Queue clear. New orders will appear here automatically.
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{order.id}</CardTitle>
                    <CardDescription>
                      {order.resident} · Flat {order.flat} · {order.garments} garments
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{order.currentStatus}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Next action</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{order.nextAction}</span>
                </div>
                <Button
                  className={cn("min-w-[160px]")}
                  onClick={() => void advance(order.id)}
                  disabled={busyId === order.id}
                >
                  {busyId === order.id ? "Updating…" : order.nextAction}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PortalShell>
  );
}
