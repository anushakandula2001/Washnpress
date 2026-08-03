"use client";

import { readApiJson } from "@/frontend/api-client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { useToast } from "@/components/ui/toast";
import { operationsNav } from "@/lib/portal-nav";
import { usePagination } from "@/lib/admin/use-pagination";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { Users } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";

// Reusing Admin residents components
import { ResidentsTable } from "@/components/admin/residents/ResidentsTable";
import { ResidentDrawer } from "@/components/admin/residents/ResidentDrawer";
import { ResidentsFilters } from "@/components/admin/residents/ResidentsFilters";
import { OrdersToolbar } from "@/components/admin/orders/OrdersToolbar";
import { Pagination } from "@/components/admin/orders/Pagination";
import { defaultResidentFilters, type ResidentFilters as ResidentFiltersType, type ResidentRow } from "@/components/admin/residents/types";

function applyClientFilters(rows: ResidentRow[], filters: ResidentFiltersType): ResidentRow[] {
  let result = [...rows];
  if (filters.q.trim()) {
    const query = filters.q.trim().toLowerCase();
    result = result.filter((r) => {
      const hay = `${r.resident_code ?? ""} ${r.full_name ?? ""} ${r.phone} ${r.society_name} ${r.tower_block ?? ""} ${r.unit_number ?? ""} ${r.email ?? ""}`.toLowerCase();
      return hay.includes(query);
    });
  }
  return result;
}

export default function ResidentsPage() {
  return (
    <Suspense>
      <ResidentsContent />
    </Suspense>
  );
}

function ResidentsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [rows, setRows] = useState<ResidentRow[]>([]);
  const [filters, setFilters] = useState<ResidentFiltersType>(defaultResidentFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerResident, setDrawerResident] = useState<ResidentRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("overview");

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/operations/customers`, { credentials: "same-origin" });
      const data = await readApiJson(res);
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows((data.residents as ResidentRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } = usePagination(filtered);

  // KPIs
  const totalResidents = rows.length;
  const activeResidents = rows.filter((r) => r.status === "active").length;
  const premiumSubscribers = rows.filter((r) => r.subscription_tier?.toLowerCase().includes("premium")).length;
  const pendingPickups = rows.reduce((acc, r) => acc + (r.orders_count > 0 ? 1 : 0), 0); // Placeholder logic

  function openDrawer(resident: ResidentRow, initialTab = "overview") {
    setDrawerResident(resident);
    setDrawerTab(initialTab);
    setDrawerOpen(true);
  }

  function closeDrawer(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setDrawerResident(null);
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

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Residents"
      subtitle="Manage residents from your assigned societies."
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Residents" value={String(totalResidents)} footnote="Assigned societies" />
        <KpiCard label="Active Residents" value={String(activeResidents)} footnote="Currently active" />
        <KpiCard label="Premium Subscribers" value={String(premiumSubscribers)} footnote="Active premium plans" />
        <KpiCard label="Pending Pickups Today" value={String(pendingPickups)} footnote="Orders pending pickup" />
      </section>

      <OrdersToolbar
        search={filters.q}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, q }))}
        onRefresh={() => void load()}
        loading={loading}
        placeholder="Search resident name, phone number, flat, tower or society..."
      />

      <ResidentsFilters
        filters={filters}
        societies={[]}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters(defaultResidentFilters)}
      />

      {!loading && paginated.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Residents Found"
          description="No residents are available for your assigned societies."
        />
      ) : (
        <ResidentsTable
          rows={paginated}
          loading={loading}
          selected={selected}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onRowClick={(row) => openDrawer(row)}
          onAction={(action, row) => {
            const validTabs = ["overview", "orders", "wallet", "subscription"];
            if (validTabs.includes(action)) {
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

      <ResidentDrawer
        residentId={drawerResident?.id ?? null}
        open={drawerOpen}
        onOpenChange={closeDrawer}
        initialTab={drawerTab}
      />
    </PortalShell>
  );
}
