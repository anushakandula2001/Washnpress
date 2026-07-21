"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { adminNav } from "@/lib/portal-nav";
import { usePagination } from "@/lib/admin/use-pagination";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/admin/export-utils";
import { BulkActionBar } from "@/components/admin/shared/BulkActionBar";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { SocietyStats } from "@/components/admin/societies/SocietyStats";
import { SocietyToolbar } from "@/components/admin/societies/SocietyToolbar";
import { SocietyFilters as SocietyFiltersPanel } from "@/components/admin/societies/SocietyFilters";
import { SocietyCards } from "@/components/admin/societies/SocietyCards";
import { SocietyTable } from "@/components/admin/societies/SocietyTable";
import { SocietyMap } from "@/components/admin/societies/SocietyMap";
import { CreateSocietyWizard } from "@/components/admin/societies/CreateSocietyWizard";
import { AssignOperatorDialog } from "@/components/admin/societies/AssignOperatorDialog";
import { Pagination } from "@/components/admin/societies/Pagination";
import {
  defaultSocietyFilters,
  type SocietyFilters,
  type SocietyRow,
  type SocietyViewMode,
} from "@/components/admin/societies/types";
import { Building2, Upload } from "lucide-react";

function applyClientFilters(rows: SocietyRow[], filters: SocietyFilters): SocietyRow[] {
  let result = [...rows];

  const q = filters.q.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        (r.pincode ?? "").includes(q) ||
        (r.assigned_operators ?? "").toLowerCase().includes(q) ||
        (r.address_line_1 ?? "").toLowerCase().includes(q),
    );
  }

  if (filters.status) result = result.filter((r) => r.status === filters.status);
  if (filters.city) result = result.filter((r) => r.city === filters.city);
  if (filters.state) result = result.filter((r) => r.state === filters.state);
  if (filters.operator === "__unassigned__") {
    result = result.filter((r) => !r.assigned_operators);
  } else if (filters.operator) {
    const op = filters.operator.toLowerCase();
    result = result.filter((r) => (r.assigned_operators ?? "").toLowerCase().includes(op));
  }
  if (filters.residentsMin) {
    const min = Number(filters.residentsMin);
    if (!isNaN(min)) result = result.filter((r) => r.residents_count >= min);
  }
  if (filters.ordersMin) {
    const min = Number(filters.ordersMin);
    if (!isNaN(min)) result = result.filter((r) => r.orders_count >= min);
  }
  if (filters.createdFrom && rows[0]?.created_at) {
    result = result.filter((r) => (r.created_at ?? "") >= filters.createdFrom);
  }
  if (filters.createdTo && rows[0]?.created_at) {
    result = result.filter((r) => (r.created_at ?? "") <= filters.createdTo + "T23:59:59");
  }

  switch (filters.sortBy) {
    case "name_desc":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "residents":
      result.sort((a, b) => b.residents_count - a.residents_count);
      break;
    case "orders":
      result.sort((a, b) => b.orders_count - a.orders_count);
      break;
    case "newest":
      result.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
      break;
    case "oldest":
      result.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
      break;
    case "revenue":
    case "wallet":
      result.sort((a, b) => Number(b.wallet_revenue ?? 0) - Number(a.wallet_revenue ?? 0));
      break;
    default:
      result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
}

export default function AdminSocietiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = useState<SocietyRow[]>([]);
  const [filters, setFilters] = useState<SocietyFilters>(defaultSocietyFilters);
  const [viewMode, setViewMode] = useState<SocietyViewMode>("cards");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSociety, setAssignSociety] = useState<SocietyRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/societies", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows((data.societies as SocietyRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cities = useMemo(
    () => [...new Set(rows.map((r) => r.city).filter(Boolean))].sort(),
    [rows],
  );

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } = usePagination(filtered);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/societies/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast(data.message ?? "Update failed", "error");
      return;
    }
    toast("Society updated", "success");
    await load();
  }

  async function bulkStatus(status: string) {
    await Promise.all([...selected].map((id) => updateStatus(id, status)));
    setSelected(new Set());
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const headers = ["Name", "City", "State", "Pincode", "Operator", "Towers", "Flats", "Residents", "Orders", "Subs", "Wallet", "Status"];
    const data = filtered.map((r) => [
      r.name,
      r.city,
      r.state,
      r.pincode ?? "",
      r.assigned_operators ?? "",
      String(r.towers_count),
      String(r.flats_count),
      String(r.residents_count),
      String(r.orders_count),
      String(r.subscriptions_count),
      String(r.wallet_revenue),
      r.status,
    ]);
    if (format === "csv") exportToCsv("societies.csv", headers, data);
    else if (format === "excel") exportToExcel("societies.xls", headers, data);
    else exportToPdf("societies.pdf", "Societies", headers, data);
    toast("Export started", "success");
  }

  function navigateToSociety(id: string, tab?: string) {
    const url = tab ? `/admin/societies/${id}?tab=${tab}` : `/admin/societies/${id}`;
    router.push(url);
  }

  function handleAction(action: string, row: SocietyRow) {
    switch (action) {
      case "view":
        navigateToSociety(row.id);
        break;
      case "edit":
        navigateToSociety(row.id, "settings");
        break;
      case "assign":
        setAssignSociety(row);
        setAssignOpen(true);
        break;
      case "slots":
        navigateToSociety(row.id, "slots");
        break;
      case "residents":
        navigateToSociety(row.id, "residents");
        break;
      case "orders":
        navigateToSociety(row.id, "orders");
        break;
      case "deactivate":
        void updateStatus(row.id, "inactive");
        break;
      case "coming_soon":
        void updateStatus(row.id, "coming_soon");
        break;
    }
  }

  function handleStatFilter(filter: string) {
    if (filter === "all") setFilters(defaultSocietyFilters);
    else if (filter === "unassigned") setFilters((f) => ({ ...f, operator: "__unassigned__" }));
    else setFilters((f) => ({ ...f, status: filter }));
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Societies"
      subtitle="Manage society network, operators, and service coverage."
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <SocietyStats rows={rows} loading={loading} onFilter={handleStatFilter} />
      <SocietyToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={() => void load()}
        onExport={handleExport}
        onImport={() => toast("Import: upload society CSV via support or bulk import tool", "info")}
        onAdd={() => setWizardOpen(true)}
        loading={loading}
      />
      <SocietyFiltersPanel
        filters={filters}
        rows={rows}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onReset={() => setFilters(defaultSocietyFilters)}
      />

      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => void bulkStatus("active")}>Activate</Button>
            <Button size="sm" variant="outline" onClick={() => void bulkStatus("inactive")}>Deactivate</Button>
            <Button size="sm" variant="outline" onClick={() => void bulkStatus("coming_soon")}>Coming Soon</Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const first = [...selected][0];
                const row = rows.find((r) => r.id === first);
                if (row) { setAssignSociety(row); setAssignOpen(true); }
              }}
            >
              Assign Operator
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>Export Selected</Button>
          </>
        }
      />

      {!loading && filtered.length === 0 ? (
        <EmptyState
          title="No societies found"
          description="Try adjusting your search or filters, or add a new society to the network."
          actions={
            <>
              <Button size="sm" className="gap-1.5" onClick={() => setWizardOpen(true)}>
                <Building2 className="h-4 w-4" />Add Society
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Upload className="h-4 w-4" />Import Societies
              </Button>
            </>
          }
        />
      ) : (
        <>
          {viewMode === "cards" && (
            <SocietyCards
              rows={paginated}
              loading={loading}
              selected={selected}
              onSelect={(id, checked) => {
                const next = new Set(selected);
                if (checked) next.add(id);
                else next.delete(id);
                setSelected(next);
              }}
              onRowClick={(r) => navigateToSociety(r.id)}
            />
          )}
          {viewMode === "table" && (
            <SocietyTable
              rows={paginated}
              loading={loading}
              selected={selected}
              onSelect={(id, checked) => {
                const next = new Set(selected);
                if (checked) next.add(id);
                else next.delete(id);
                setSelected(next);
              }}
              onSelectAll={(checked) => setSelected(checked ? new Set(paginated.map((r) => r.id)) : new Set())}
              onRowClick={(r) => navigateToSociety(r.id)}
              onAction={handleAction}
            />
          )}
          {viewMode === "map" && (
            <SocietyMap rows={paginated} loading={loading} onRowClick={(r) => navigateToSociety(r.id)} />
          )}
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
        </>
      )}

      <CreateSocietyWizard open={wizardOpen} onOpenChange={setWizardOpen} onCreated={() => void load()} />
      {assignSociety && (
        <AssignOperatorDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          societyId={assignSociety.id}
          societyName={assignSociety.name}
          onAssigned={() => void load()}
        />
      )}
    </PortalShell>
  );
}
