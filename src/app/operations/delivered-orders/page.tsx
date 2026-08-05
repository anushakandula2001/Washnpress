"use client";

import { readApiJson } from "@/frontend/api-client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
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
import { CheckCircle2 } from "lucide-react";

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

export default function DeliveredOrdersPage() {
  return (
    <Suspense>
      <DeliveredOrdersContent />
    </Suspense>
  );
}

function DeliveredOrdersContent() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [filters, setFilters] = useState<OrderFiltersType>(defaultOrderFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [drawerOrder, setDrawerOrder] = useState<OrderRow | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("status", "DELIVERED");
      if (filters.q) params.set("q", filters.q);
      const res = await fetch(`/api/operations/orders?${params}`, { credentials: "same-origin" });
      const data = await readApiJson(res);
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows(((data.orders as Array<Record<string, unknown>>) ?? []).map(normalizeOrderRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [filters.q]);

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
    window.history.replaceState(null, "", `/operations/delivered-orders?order=${order.order_code}`);
  }

  function closeDrawer(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setDrawerOrder(null);
      window.history.replaceState(null, "", "/operations/delivered-orders");
    }
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Delivered Orders"
      subtitle="History of successfully delivered orders"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <OrdersToolbar
        search={filters.q}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, q }))}
        onRefresh={() => void load()}
        loading={loading}
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
          icon={CheckCircle2}
          title="No Delivered Orders"
          description="There are no completed deliveries yet."
        />
      ) : (
        <OrdersTable
          rows={paginated}
          loading={loading}
          selected={new Set()}
          onSelect={() => {}}
          onSelectAll={() => {}}
          onRowClick={(row) => openDrawer(row)}
          onAction={(action, row) => {
            const tabs = ["overview", "timeline", "resident", "operator", "items", "notes", "activity"];
            if (tabs.includes(action)) {
              openDrawer(row, action);
            }
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
