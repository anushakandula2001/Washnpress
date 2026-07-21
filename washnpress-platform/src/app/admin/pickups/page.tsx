"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { useToast } from "@/components/ui/toast";
import { adminNav } from "@/lib/portal-nav";
import { usePagination } from "@/lib/admin/use-pagination";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/admin/export-utils";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { PickupStats } from "@/components/admin/pickups/PickupStats";
import { PickupToolbar } from "@/components/admin/pickups/PickupToolbar";
import { PickupFilters } from "@/components/admin/pickups/PickupFilters";
import { PickupTable } from "@/components/admin/pickups/PickupTable";
import { PickupDrawer } from "@/components/admin/pickups/PickupDrawer";
import { AssignOperatorDialog } from "@/components/admin/pickups/AssignOperatorDialog";
import { Pagination } from "@/components/admin/pickups/Pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PICKUP_TABS,
  defaultPickupFilters,
  type PickupFilters as PickupFiltersType,
  type PickupRow,
  type PickupStats as PickupStatsType,
  type PickupTab,
  type SocietyOpt,
  type OperatorOpt,
} from "@/components/admin/pickups/types";
import { CalendarClock } from "lucide-react";

function normalizeRow(raw: Record<string, unknown>): PickupRow {
  return {
    id: String(raw.id),
    status: String(raw.status ?? "scheduled"),
    scheduled_for: String(raw.scheduled_for ?? ""),
    recurring: Boolean(raw.recurring),
    recurring_day: raw.recurring_day ? String(raw.recurring_day) : null,
    special_instructions: raw.special_instructions ? String(raw.special_instructions) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    resident_id: String(raw.resident_id ?? ""),
    resident_name: String(raw.resident_name ?? ""),
    resident_code: raw.resident_code ? String(raw.resident_code) : null,
    resident_email: raw.resident_email ? String(raw.resident_email) : null,
    phone: String(raw.phone ?? ""),
    society_id: String(raw.society_id ?? ""),
    society_name: String(raw.society_name ?? ""),
    society_city: raw.society_city ? String(raw.society_city) : null,
    tower_block: raw.tower_block ? String(raw.tower_block) : null,
    unit_number: raw.unit_number ? String(raw.unit_number) : null,
    slot_window: raw.slot_window ? String(raw.slot_window) : null,
    start_time: raw.start_time ? String(raw.start_time) : null,
    end_time: raw.end_time ? String(raw.end_time) : null,
    order_id: raw.order_id ? String(raw.order_id) : null,
    order_code: raw.order_code ? String(raw.order_code) : null,
    order_status: raw.order_status ? String(raw.order_status) : null,
    pickup_garment_count: raw.pickup_garment_count != null ? Number(raw.pickup_garment_count) : null,
    operator_id: raw.operator_id ? String(raw.operator_id) : null,
    operator_code: raw.operator_code ? String(raw.operator_code) : null,
    operator_name: raw.operator_name ? String(raw.operator_name) : null,
    operator_phone: raw.operator_phone ? String(raw.operator_phone) : null,
  };
}

function applyClientFilters(rows: PickupRow[], filters: PickupFiltersType): PickupRow[] {
  let result = [...rows];

  if (filters.status) {
    result = result.filter((r) => r.status === filters.status);
  }
  if (filters.dateFrom) {
    result = result.filter((r) => r.scheduled_for.slice(0, 10) >= filters.dateFrom);
  }
  if (filters.dateTo) {
    result = result.filter((r) => r.scheduled_for.slice(0, 10) <= filters.dateTo);
  }

  switch (filters.sortBy) {
    case "scheduled_asc":
      result.sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for));
      break;
    case "resident":
      result.sort((a, b) => a.resident_name.localeCompare(b.resident_name));
      break;
    case "society":
      result.sort((a, b) => a.society_name.localeCompare(b.society_name));
      break;
    default:
      result.sort((a, b) => b.scheduled_for.localeCompare(a.scheduled_for));
  }

  return result;
}

export default function AdminPickupsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<PickupTab>("today");
  const [rows, setRows] = useState<PickupRow[]>([]);
  const [stats, setStats] = useState<PickupStatsType | null>(null);
  const [societies, setSocieties] = useState<SocietyOpt[]>([]);
  const [operators, setOperators] = useState<OperatorOpt[]>([]);
  const [filters, setFilters] = useState<PickupFiltersType>(defaultPickupFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSociety, setAssignSociety] = useState<{ id: string; name: string } | null>(null);

  const activeFilter = PICKUP_TABS.find((t) => t.id === tab)?.filter ?? "today";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("filter", activeFilter);
      params.set("stats", "1");
      if (filters.q) params.set("q", filters.q);
      if (filters.societyId) params.set("societyId", filters.societyId);
      if (filters.operatorId) params.set("operatorId", filters.operatorId);

      const res = await fetch(`/api/admin/pickups?${params}`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows(((data.pickups as Array<Record<string, unknown>>) ?? []).map(normalizeRow));
      if (data.stats) setStats(data.stats as PickupStatsType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
      toast(err instanceof Error ? err.message : "Load failed", "error");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, filters.q, filters.societyId, filters.operatorId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetch("/api/admin/societies", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) =>
        setSocieties(
          ((d.societies as Array<{ id: string; name: string; city?: string }>) ?? []).map((s) => ({
            id: s.id,
            name: s.name,
            city: s.city ?? null,
          })),
        ),
      )
      .catch(() => null);
    void fetch("/api/admin/operators", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) =>
        setOperators(
          ((d.operators as OperatorOpt[]) ?? []).map((o) => ({
            id: o.id,
            operator_code: o.operator_code,
            full_name: o.full_name,
            status: o.status,
          })),
        ),
      )
      .catch(() => null);
  }, []);

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } = usePagination(filtered);

  function openDrawer(row: PickupRow, initialTab = "overview") {
    setDrawerId(row.id);
    setDrawerTab(initialTab);
    setDrawerOpen(true);
  }

  function openAssign(societyId: string, societyName: string) {
    setAssignSociety({ id: societyId, name: societyName });
    setAssignOpen(true);
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const headers = [
      "Scheduled",
      "Resident",
      "Phone",
      "Society",
      "Unit",
      "Slot",
      "Order",
      "Operator",
      "Garments",
      "Status",
    ];
    const exportRows = filtered.map((r) => [
      new Date(r.scheduled_for).toLocaleString(),
      r.resident_name,
      r.phone,
      r.society_name,
      [r.tower_block, r.unit_number].filter(Boolean).join(" "),
      r.slot_window ?? "",
      r.order_code ?? "",
      r.operator_name ?? "Unassigned",
      String(r.pickup_garment_count ?? ""),
      r.status,
    ]);
    const filename = `pickups-${tab}-${new Date().toISOString().slice(0, 10)}`;
    if (format === "csv") exportToCsv(`${filename}.csv`, headers, exportRows);
    else if (format === "excel") exportToExcel(`${filename}.xls`, headers, exportRows);
    else exportToPdf(`${filename}.pdf`, "WashNPress Pickups", headers, exportRows);
    toast(`Exported ${filtered.length} pickups`, "success");
  }

  const tabLabel = PICKUP_TABS.find((t) => t.id === tab)?.label ?? "Pickups";

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Pickups"
      subtitle={`${filtered.length} pickups · ${tabLabel}`}
    >
      <PickupStats stats={stats} loading={loading && !stats} onTabChange={setTab} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as PickupTab)} className="mb-4">
        <TabsList>
          {PICKUP_TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <PickupToolbar
        search={filters.q}
        onSearchChange={(q) => setFilters((f) => ({ ...f, q }))}
        onRefresh={() => void load()}
        onExport={handleExport}
        loading={loading}
      />

      <PickupFilters
        filters={filters}
        societies={societies}
        operators={operators}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onReset={() => setFilters(defaultPickupFilters)}
      />

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <PickupTable rows={paginated} loading={loading} onRowClick={(r) => openDrawer(r)} />

      {!loading && filtered.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={CalendarClock}
            title="No pickups found"
            description={`No pickups match the current tab and filters.`}
          />
        </div>
      )}

      {filtered.length > 0 && (
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

      <PickupDrawer
        pickupId={drawerId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialTab={drawerTab}
        onAssignOperator={openAssign}
        onRefreshList={() => void load()}
      />

      {assignSociety && (
        <AssignOperatorDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          societyId={assignSociety.id}
          societyName={assignSociety.name}
          onAssigned={() => {
            void load();
            if (drawerId) {
              setDrawerOpen(true);
            }
          }}
        />
      )}
    </PortalShell>
  );
}
