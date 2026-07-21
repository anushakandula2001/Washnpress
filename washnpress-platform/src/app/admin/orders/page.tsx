"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { adminNav } from "@/lib/portal-nav";
import { usePagination } from "@/lib/admin/use-pagination";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/admin/export-utils";
import { BulkActionBar } from "@/components/admin/shared/BulkActionBar";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { OrderStats } from "@/components/admin/orders/OrderStats";
import { OrdersToolbar } from "@/components/admin/orders/OrdersToolbar";
import { OrdersFilters } from "@/components/admin/orders/OrdersFilters";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { OrderDrawer } from "@/components/admin/orders/OrderDrawer";
import { AssignOperatorDialog } from "@/components/admin/orders/AssignOperatorDialog";
import { Pagination } from "@/components/admin/orders/Pagination";
import {
  defaultOrderFilters,
  normalizeOrderRow,
  ORDER_TABS,
  type OrderFilters as OrderFiltersType,
  type OrderRow,
  type OrderTab,
  type OperatorOpt,
  type SocietyOpt,
} from "@/components/admin/orders/types";
import { ShoppingBag } from "lucide-react";

function applyClientFilters(rows: OrderRow[], filters: OrderFiltersType): OrderRow[] {
  let result = [...rows];

  if (filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    result = result.filter((r) => {
      const hay = `${r.order_code} ${r.resident_name} ${r.resident_phone} ${r.society_name} ${r.operator_code ?? ""} ${r.operator_name ?? ""} ${r.status}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (filters.status) {
    result = result.filter((r) => r.status.toLowerCase() === filters.status.toLowerCase());
  }

  if (filters.dateFrom) {
    result = result.filter((r) => r.created_at.slice(0, 10) >= filters.dateFrom);
  }
  if (filters.dateTo) {
    result = result.filter((r) => r.created_at.slice(0, 10) <= filters.dateTo);
  }

  switch (filters.sortBy) {
    case "oldest":
      result.sort((a, b) => a.created_at.localeCompare(b.created_at));
      break;
    case "scheduled":
      result.sort((a, b) => (a.scheduled_for ?? "").localeCompare(b.scheduled_for ?? ""));
      break;
    case "garments":
      result.sort((a, b) => b.pickup_garment_count - a.pickup_garment_count);
      break;
    case "resident":
      result.sort((a, b) => a.resident_name.localeCompare(b.resident_name));
      break;
    case "society":
      result.sort((a, b) => a.society_name.localeCompare(b.society_name));
      break;
    default:
      result.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  return result;
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrdersContent />
    </Suspense>
  );
}

function AdminOrdersContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<OrderTab>("all");
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [statsRows, setStatsRows] = useState<OrderRow[]>([]);
  const [societies, setSocieties] = useState<SocietyOpt[]>([]);
  const [operators, setOperators] = useState<OperatorOpt[]>([]);
  const [filters, setFilters] = useState<OrderFiltersType>(defaultOrderFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOrder, setDrawerOrder] = useState<OrderRow | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrder, setAssignOrder] = useState<OrderRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tab !== "all") params.set("filter", tab);
      if (filters.societyId) params.set("societyId", filters.societyId);
      if (filters.operatorId) params.set("operatorId", filters.operatorId);
      if (filters.q) params.set("q", filters.q);
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows(((data.orders as Array<Record<string, unknown>>) ?? []).map(normalizeOrderRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [tab, filters.societyId, filters.operatorId, filters.q]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) {
        setStatsRows(((data.orders as Array<Record<string, unknown>>) ?? []).map(normalizeOrderRow));
      }
    } catch {
      /* stats are non-blocking */
    }
  }, []);

  useEffect(() => {
    void fetch("/api/admin/societies", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) =>
        setSocieties(
          ((d.societies as Array<{ id: string; name: string }>) ?? []).map((s) => ({
            id: s.id,
            name: s.name,
          })),
        ),
      )
      .catch(() => null);

    void fetch("/api/admin/operators", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) =>
        setOperators(
          ((d.operators as Array<Record<string, unknown>>) ?? []).map((o) => ({
            id: String(o.id),
            operator_code: o.operator_code ? String(o.operator_code) : null,
            full_name: String(o.full_name ?? ""),
            phone: String(o.phone ?? ""),
            status: o.status ? String(o.status) : undefined,
          })),
        ),
      )
      .catch(() => null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

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
    if (loading) return;
    void fetch(`/api/admin/orders?id=${encodeURIComponent(orderParam)}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.order) return;
        const o = data.order as Record<string, unknown>;
        setDrawerOrder(
          normalizeOrderRow({
            ...o,
            resident_name: o.resident_name,
            society_name: o.society_name,
            resident_phone: o.resident_phone,
            resident_id: o.resident_id,
            society_id: o.society_id,
          }),
        );
        setDrawerTab("overview");
        setDrawerOpen(true);
      })
      .catch(() => null);
  }, [searchParams, rows, loading]);

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } = usePagination(filtered);

  function openDrawer(order: OrderRow, initialTab = "overview") {
    setDrawerOrder(order);
    setDrawerTab(initialTab);
    setDrawerOpen(true);
    window.history.replaceState(null, "", `/admin/orders?order=${order.order_code}`);
  }

  function closeDrawer(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setDrawerOrder(null);
      window.history.replaceState(null, "", "/admin/orders");
    }
  }

  function openAssign(order: OrderRow) {
    setAssignOrder(order);
    setAssignOpen(true);
  }

  function handleAction(action: string, row: OrderRow) {
    switch (action) {
      case "view":
        openDrawer(row, "overview");
        break;
      case "timeline":
        openDrawer(row, "timeline");
        break;
      case "resident":
        openDrawer(row, "resident");
        break;
      case "operator":
        openDrawer(row, "operator");
        break;
      case "items":
        openDrawer(row, "items");
        break;
      case "notes":
        openDrawer(row, "notes");
        break;
      case "activity":
        openDrawer(row, "activity");
        break;
      case "assign":
        openAssign(row);
        break;
      default:
        openDrawer(row);
    }
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const headers = [
      "Order",
      "Status",
      "Resident",
      "Phone",
      "Society",
      "Unit",
      "Operator",
      "Garments",
      "Delivered",
      "Scheduled",
      "Created",
    ];
    const data = filtered.map((r) => [
      r.order_code,
      r.status,
      r.resident_name,
      r.resident_phone,
      r.society_name,
      [r.tower_block, r.unit_number].filter(Boolean).join(" "),
      r.operator_name ? `${r.operator_code ?? ""} ${r.operator_name}`.trim() : "Unassigned",
      String(r.pickup_garment_count),
      r.delivered_garment_count != null ? String(r.delivered_garment_count) : "",
      r.scheduled_for ? new Date(r.scheduled_for).toLocaleString() : "",
      r.created_at ? new Date(r.created_at).toLocaleString() : "",
    ]);
    const tabLabel = ORDER_TABS.find((t) => t.id === tab)?.label ?? "Orders";
    const filename = `orders-${tab}`;
    if (format === "csv") exportToCsv(`${filename}.csv`, headers, data);
    else if (format === "excel") exportToExcel(`${filename}.xls`, headers, data);
    else exportToPdf(`${filename}.pdf`, `Orders — ${tabLabel}`, headers, data);
    toast("Export started", "success");
  }

  async function refreshAll() {
    await Promise.all([load(), loadStats()]);
    toast("Orders refreshed", "success");
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Orders"
      subtitle="Cross-portal order oversight from PostgreSQL"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <OrderStats
        rows={statsRows}
        loading={loading && statsRows.length === 0}
        onTabChange={setTab}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {ORDER_TABS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={tab === f.id ? "default" : "outline"}
            onClick={() => setTab(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <OrdersToolbar
        search={filters.q}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, q }))}
        onRefresh={() => void refreshAll()}
        onExport={handleExport}
        loading={loading}
      />

      <OrdersFilters
        filters={filters}
        societies={societies}
        operators={operators}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters(defaultOrderFilters)}
      />

      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const first = filtered.find((r) => selected.has(r.id));
                if (first) openAssign(first);
              }}
            >
              Assign Operator
            </Button>
          }
        />
      )}

      {!loading && paginated.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders"
          description={`No orders in ${ORDER_TABS.find((t) => t.id === tab)?.label?.toLowerCase() ?? "this view"} match your filters.`}
        />
      ) : (
        <OrdersTable
          rows={paginated}
          loading={loading}
          selected={selected}
          onSelect={(id, checked) =>
            setSelected((prev) => {
              const next = new Set(prev);
              if (checked) next.add(id);
              else next.delete(id);
              return next;
            })
          }
          onSelectAll={(checked) =>
            setSelected(checked ? new Set(paginated.map((r) => r.id)) : new Set())
          }
          onRowClick={(row) => openDrawer(row)}
          onAction={handleAction}
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
        orderId={drawerOrder?.id ?? drawerOrder?.order_code ?? null}
        row={drawerOrder}
        open={drawerOpen}
        onOpenChange={closeDrawer}
        initialTab={drawerTab}
        onAssignOperator={openAssign}
        onRefreshList={() => void refreshAll()}
      />

      {assignOrder && (
        <AssignOperatorDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          societyId={assignOrder.society_id}
          societyName={assignOrder.society_name}
          orderCode={assignOrder.order_code}
          onAssigned={() => void refreshAll()}
        />
      )}
    </PortalShell>
  );
}
