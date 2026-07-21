"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { adminNav } from "@/lib/portal-nav";
import { usePagination } from "@/lib/admin/use-pagination";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/admin/export-utils";
import { BulkActionBar } from "@/components/admin/shared/BulkActionBar";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { DeliveryStats } from "@/components/admin/deliveries/DeliveryStats";
import { DeliveryToolbar } from "@/components/admin/deliveries/DeliveryToolbar";
import { DeliveryFilters } from "@/components/admin/deliveries/DeliveryFilters";
import { DeliveryTable } from "@/components/admin/deliveries/DeliveryTable";
import { DeliveryDrawer } from "@/components/admin/deliveries/DeliveryDrawer";
import { AssignOperatorDialog } from "@/components/admin/deliveries/AssignOperatorDialog";
import { RescheduleDeliveryDialog } from "@/components/admin/deliveries/RescheduleDeliveryDialog";
import { Pagination } from "@/components/admin/deliveries/Pagination";
import {
  defaultDeliveryFilters,
  DELIVERY_TABS,
  normalizeDeliveryRow,
  type DeliveryFilters as DeliveryFiltersType,
  type DeliveryRow,
  type DeliveryTab,
  type OperatorOpt,
  type SocietyOpt,
} from "@/components/admin/deliveries/types";
import { Truck } from "lucide-react";

function applyClientFilters(rows: DeliveryRow[], filters: DeliveryFiltersType): DeliveryRow[] {
  let result = [...rows];

  if (filters.dateFrom) {
    result = result.filter((r) => r.scheduled_for >= filters.dateFrom);
  }
  if (filters.dateTo) {
    result = result.filter((r) => r.scheduled_for <= filters.dateTo + "T23:59:59");
  }

  switch (filters.sortBy) {
    case "oldest":
      result.sort((a, b) => (a.updated_at ?? "").localeCompare(b.updated_at ?? ""));
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
    default:
      result.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  }

  return result;
}

export default function AdminDeliveriesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<DeliveryTab>("ready");
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [statsRows, setStatsRows] = useState<DeliveryRow[]>([]);
  const [societies, setSocieties] = useState<SocietyOpt[]>([]);
  const [operators, setOperators] = useState<OperatorOpt[]>([]);
  const [filters, setFilters] = useState<DeliveryFiltersType>(defaultDeliveryFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerDelivery, setDrawerDelivery] = useState<DeliveryRow | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDelivery, setAssignDelivery] = useState<DeliveryRow | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDelivery, setRescheduleDelivery] = useState<DeliveryRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ filter: tab });
      if (filters.q) params.set("q", filters.q);
      if (filters.societyId) params.set("societyId", filters.societyId);
      if (filters.operatorId) params.set("operatorId", filters.operatorId);
      const res = await fetch(`/api/admin/deliveries?${params}`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows(((data.deliveries as Array<Record<string, unknown>>) ?? []).map(normalizeDeliveryRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [tab, filters.q, filters.societyId, filters.operatorId]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/deliveries", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) {
        setStatsRows(((data.deliveries as Array<Record<string, unknown>>) ?? []).map(normalizeDeliveryRow));
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
  }, [loadStats, tab]);

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } = usePagination(filtered);

  function openDrawer(delivery: DeliveryRow, initialTab = "overview") {
    setDrawerDelivery(delivery);
    setDrawerTab(initialTab);
    setDrawerOpen(true);
  }

  function openAssign(delivery: DeliveryRow) {
    setAssignDelivery(delivery);
    setAssignOpen(true);
  }

  function openReschedule(delivery: DeliveryRow) {
    setRescheduleDelivery(delivery);
    setRescheduleOpen(true);
  }

  function handleAction(action: string, row: DeliveryRow) {
    switch (action) {
      case "view":
        openDrawer(row, "overview");
        break;
      case "assign":
        openAssign(row);
        break;
      case "reschedule":
        openReschedule(row);
        break;
      case "resident":
        openDrawer(row, "resident");
        break;
      case "operator":
        openDrawer(row, "operator");
        break;
      case "timeline":
        openDrawer(row, "timeline");
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
      "Updated",
    ];
    const data = filtered.map((r) => [
      r.order_code,
      r.status,
      r.resident_name,
      r.phone,
      r.society_name,
      [r.tower_block, r.unit_number].filter(Boolean).join(" "),
      r.operator_name ?? "Unassigned",
      String(r.pickup_garment_count),
      r.delivered_garment_count != null ? String(r.delivered_garment_count) : "",
      r.scheduled_for ? new Date(r.scheduled_for).toLocaleString() : "",
      r.updated_at ? new Date(r.updated_at).toLocaleString() : "",
    ]);
    const filename = `deliveries-${tab}`;
    if (format === "csv") exportToCsv(`${filename}.csv`, headers, data);
    else if (format === "excel") exportToExcel(`${filename}.xls`, headers, data);
    else exportToPdf(`${filename}.pdf`, `Deliveries — ${DELIVERY_TABS.find((t) => t.id === tab)?.label}`, headers, data);
    toast("Export started", "success");
  }

  async function refreshAll() {
    await Promise.all([load(), loadStats()]);
    toast("Deliveries refreshed", "success");
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Deliveries"
      subtitle="Manage delivery pipeline — ready, out for delivery, delivered, and failed orders"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <DeliveryStats rows={statsRows} loading={loading && statsRows.length === 0} onTabChange={setTab} />

      <div className="mb-4 flex flex-wrap gap-2">
        {DELIVERY_TABS.map((f) => (
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

      <DeliveryToolbar
        search={filters.q}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, q }))}
        onRefresh={() => void refreshAll()}
        onExport={handleExport}
        loading={loading}
      />

      <DeliveryFilters
        filters={filters}
        societies={societies}
        operators={operators}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters(defaultDeliveryFilters)}
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
          icon={Truck}
          title="No deliveries"
          description={`No orders in the ${DELIVERY_TABS.find((t) => t.id === tab)?.label?.toLowerCase()} stage match your filters.`}
        />
      ) : (
        <DeliveryTable
          rows={paginated}
          loading={loading}
          selected={selected}
          onSelect={(id, checked) => {
            setSelected((prev) => {
              const next = new Set(prev);
              if (checked) next.add(id);
              else next.delete(id);
              return next;
            });
          }}
          onSelectAll={(checked) => {
            setSelected(checked ? new Set(paginated.map((r) => r.id)) : new Set());
          }}
          onRowClick={(row) => openDrawer(row)}
          onAction={handleAction}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        from={from}
        to={to}
        total={total}
        onPageChange={goTo}
        onPageSizeChange={setSize}
      />

      <DeliveryDrawer
        delivery={drawerDelivery}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialTab={drawerTab}
        onAssign={openAssign}
        onReschedule={openReschedule}
      />

      <AssignOperatorDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        delivery={assignDelivery}
        operators={operators}
        onSuccess={() => void refreshAll()}
      />

      <RescheduleDeliveryDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        delivery={rescheduleDelivery}
        onSuccess={() => void refreshAll()}
      />
    </PortalShell>
  );
}
