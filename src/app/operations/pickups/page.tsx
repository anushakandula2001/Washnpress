"use client";

import { useEffect, useState, useMemo } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { OrderDrawer } from "@/components/admin/orders/OrderDrawer";
import type { OrderRow } from "@/components/admin/orders/types";
import { api } from "@/frontend/api-client";

export default function PickupsPage() {
  const [pickups, setPickups] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerOrder, setDrawerOrder] = useState<OrderRow | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await fetch("/api/operations/queue", { credentials: "same-origin" }).then((r) => r.json());
      const pickupStatuses = ["Scheduled", "Pickup Scheduled"];
      setPickups(data.queue?.filter((q: any) => pickupStatuses.includes(q.status)) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(pickups.map((p) => p.id)));
    else setSelected(new Set());
  };

  const openDrawer = (order: OrderRow, tab = "overview") => {
    setDrawerOrder(order);
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const handleCompletePickup = async (row: OrderRow) => {
    setBusyIds((prev) => new Set(prev).add(row.id));
    try {
      await fetch(`/api/operations/orders/${row.order_code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Picked Up" }),
      });
      // Remove from view
      setPickups((prev) => prev.filter((p) => p.id !== row.id));
    } catch (err) {
      console.error("Failed to complete pickup", err);
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
    }
  };

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Today's Pickups"
      subtitle="Manage your scheduled pickups for today"
    >
      <div className="space-y-4">
        <OrdersTable
          rows={pickups}
          loading={loading}
          selected={selected}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onRowClick={(row) => openDrawer(row, "overview")}
          onAction={(action, row) => {
            const tabs = ["overview", "timeline", "resident", "operator", "items", "notes", "activity"];
            if (tabs.includes(action)) {
              openDrawer(row, action);
            }
          }}
          primaryAction={{
            label: "Complete Pickup",
            onClick: handleCompletePickup,
            isBusy: (row) => busyIds.has(row.id),
          }}
        />
      </div>

      <OrderDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        orderId={drawerOrder?.id ?? null}
        initialTab={drawerTab}
        onRefreshList={loadQueue}
        apiBaseUrl="/api/operations/orders"
      />
    </PortalShell>
  );
}
