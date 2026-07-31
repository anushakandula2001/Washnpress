"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { useToast } from "@/components/ui/toast";
import { operationsNav } from "@/lib/portal-nav";
import { usePagination } from "@/lib/admin/use-pagination";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { OrdersToolbar } from "@/components/admin/orders/OrdersToolbar";
import { OrdersFilters } from "@/components/admin/orders/OrdersFilters";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { OrderDrawer } from "@/components/admin/orders/OrderDrawer";
import { Pagination } from "@/components/admin/orders/Pagination";
import {
  defaultOrderFilters,
  normalizeOrderRow,
  type OrderFilters as OrderFiltersType,
  type OrderRow,
} from "@/components/admin/orders/types";
import { Package } from "lucide-react";

function applyClientFilters(rows: OrderRow[], filters: OrderFiltersType): OrderRow[] {
  let result = [...rows];
  if (filters.q.trim()) {
    const query = filters.q.trim().toLowerCase();
    result = result.filter((r) => {
      const hay = `${r.order_code} ${r.resident_name} ${r.resident_phone} ${r.society_name} ${r.status}`.toLowerCase();
      return hay.includes(query);
    });
  }
  return result;
}

export default function PickupsPage() {
  return (
    <Suspense>
      <PickupsContent />
    </Suspense>
  );
}

function PickupsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [filters, setFilters] = useState<OrderFiltersType>(defaultOrderFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [drawerOrder, setDrawerOrder] = useState<OrderRow | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use queue endpoint to fetch scheduled pickups
      const data = await fetch("/api/operations/queue", { credentials: "same-origin" }).then((r) => r.json());
      const pickupStatuses = ["Scheduled", "Pickup Scheduled"];
      const orders = data.queue?.filter((q: any) => pickupStatuses.includes(q.status)) || [];
      setRows((orders as Array<Record<string, unknown>>).map(normalizeOrderRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (!orderParam) return;
    const match = rows.find((r) => r.order_code === orderParam || r.id === orderParam);
    if (match) {
      setDrawerOrder(match);
      setDrawerTab("overview");
      setDrawerOpen(true);
      return;
    }
  }, [searchParams, rows]);

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } = usePagination(filtered);

  function openDrawer(order: OrderRow, initialTab = "overview") {
    setDrawerOrder(order);
    setDrawerTab(initialTab);
    setDrawerOpen(true);
    window.history.replaceState(null, "", `/operations/pickups?order=${order.order_code}`);
  }

  function closeDrawer(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setDrawerOrder(null);
      window.history.replaceState(null, "", "/operations/pickups");
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(paginated.map((p) => p.id)));
    else setSelected(new Set());
  };

  async function handleCompletePickup(row: OrderRow) {
    if (busyIds.has(row.id)) return;
    setBusyIds((prev) => new Set(prev).add(row.id));
    try {
      await fetch(`/api/operations/orders/${row.order_code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Picked Up" }),
      });
      toast(`Order ${row.order_code} marked as picked up`, "success");
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to complete pickup", "error");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
    }
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Today's Pickups"
      subtitle="Manage your scheduled pickups for today"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <OrdersToolbar
        search={filters.q}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, q }))}
        onRefresh={() => void load()}
        loading={loading}
        placeholder="Search order code, resident, phone, society, operator..."
      />

      <OrdersFilters
        filters={filters}
        societies={[]}
        operators={[]}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters(defaultOrderFilters)}
      />

      {!loading && paginated.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Today's Pickups"
          description="No scheduled pickup orders for today."
        />
      ) : (
        <OrdersTable
          rows={paginated}
          loading={loading}
          selected={selected}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onRowClick={(row) => openDrawer(row)}
          onAction={(action, row) => {
            const tabs = ["overview", "timeline", "resident", "operator", "items", "notes", "activity"];
            if (tabs.includes(action)) {
              openDrawer(row, action);
            }
          }}
          primaryAction={{
            label: "Complete Pickup",
            onClick: handleCompletePickup,
            isBusy: (r) => busyIds.has(r.id)
          }}
        />
      )}

      {total > 0 && (
        <Pagination
          from={from}
          to={to}
          total={total}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={goTo}
          onPageSizeChange={setSize}
        />
      )}

      <OrderDrawer
        apiBaseUrl="/api/operations/orders"
        orderId={drawerOrder?.id ?? drawerOrder?.order_code ?? null}
        row={drawerOrder}
        open={drawerOpen}
        onOpenChange={closeDrawer}
        initialTab={drawerTab}
        onRefreshList={() => void load()}
      />
    </PortalShell>
  );
}
