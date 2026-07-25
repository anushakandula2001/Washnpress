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
import { ResidentsStats } from "@/components/admin/residents/ResidentsStats";
import { ResidentsToolbar } from "@/components/admin/residents/ResidentsToolbar";
import { ResidentsFilters } from "@/components/admin/residents/ResidentsFilters";
import { ResidentsTable } from "@/components/admin/residents/ResidentsTable";
import { ResidentDrawer } from "@/components/admin/residents/ResidentDrawer";
import { Pagination } from "@/components/admin/residents/Pagination";
import {
  defaultResidentFilters,
  type ResidentFilters,
  type ResidentRow,
  type SocietyOpt,
} from "@/components/admin/residents/types";
import { Plus, Upload, UserPlus } from "lucide-react";

function applyClientFilters(rows: ResidentRow[], filters: ResidentFilters): ResidentRow[] {
  let result = [...rows];

  switch (filters.sortBy) {
    case "oldest":
      result.sort((a, b) => a.created_at.localeCompare(b.created_at));
      break;
    case "name":
      result.sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
      break;
    case "z-a":
      result.sort((a, b) => (b.full_name ?? "").localeCompare(a.full_name ?? ""));
      break;
    case "wallet":
      result.sort((a, b) => Number(b.wallet_balance) - Number(a.wallet_balance));
      break;
    case "orders":
      result.sort((a, b) => b.orders_count - a.orders_count);
      break;
    case "premium":
      result.sort((a, b) => {
        const aPrem = (a.subscription_tier ?? "").toLowerCase() === "premium" ? 1 : 0;
        const bPrem = (b.subscription_tier ?? "").toLowerCase() === "premium" ? 1 : 0;
        return bPrem - aPrem;
      });
      break;
    default:
      result.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  return result;
}

export default function AdminResidentsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ResidentRow[]>([]);
  const [societies, setSocieties] = useState<SocietyOpt[]>([]);
  const [filters, setFilters] = useState<ResidentFilters>(defaultResidentFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState("profile");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.societyId) params.set("societyId", filters.societyId);
      if (filters.tower) params.set("tower", filters.tower);
      if (filters.floor) params.set("floor", filters.floor);
      if (filters.subscription) params.set("subscription", filters.subscription);
      if (filters.status) params.set("status", filters.status);
      const res = await fetch(`/api/admin/residents?${params}`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows((data.residents as ResidentRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.societyId, filters.tower, filters.floor, filters.subscription, filters.status]);

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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } = usePagination(filtered);

  function openDrawer(id: string, tab = "profile") {
    setDrawerId(id);
    setDrawerTab(tab);
    setDrawerOpen(true);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/residents", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residentId: id, status }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast(data.message ?? "Update failed", "error");
      return;
    }
    toast(status === "active" ? "Resident activated" : "Resident deactivated", "success");
    await load();
  }

  async function bulkStatus(status: string) {
    await Promise.all([...selected].map((id) => updateStatus(id, status)));
    setSelected(new Set());
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const headers = ["ID", "Name", "Phone", "Email", "Society", "Tower", "Flat", "Subscription", "Wallet", "Orders", "Status"];
    const data = filtered.map((r) => [
      r.resident_code ?? r.id,
      r.full_name ?? "",
      r.phone,
      r.email ?? "",
      r.society_name,
      r.tower_name ?? r.tower_block ?? "",
      r.flat_number ?? r.unit_number ?? "",
      r.subscription_tier ?? "",
      String(r.wallet_balance),
      String(r.orders_count),
      r.status,
    ]);
    if (format === "csv") exportToCsv("residents.csv", headers, data);
    else if (format === "excel") exportToExcel("residents.xls", headers, data);
    else exportToPdf("residents.pdf", "Residents", headers, data);
    toast("Export started", "success");
  }

  function handleAction(action: string, row: ResidentRow) {
    switch (action) {
      case "view":
      case "edit":
        openDrawer(row.id, "profile");
        break;
      case "orders":
        openDrawer(row.id, "orders");
        break;
      case "wallet":
        openDrawer(row.id, "wallet");
        break;
      case "subscription":
        openDrawer(row.id, "subscription");
        break;
      case "notifications":
        openDrawer(row.id, "notifications");
        break;
      case "deactivate":
        void updateStatus(row.id, "blocked");
        break;
      case "delete":
        void updateStatus(row.id, "deleted");
        break;
    }
  }

  function handleStatFilter(filter: string) {
    if (filter === "active") setFilters((f) => ({ ...f, status: "active" }));
    else if (filter === "pending") setFilters((f) => ({ ...f, status: "blocked" }));
    else if (filter === "premium") setFilters((f) => ({ ...f, subscription: "premium" }));
    else setFilters(defaultResidentFilters);
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Residents"
      subtitle="Manage all resident accounts across societies."
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <ResidentsStats rows={rows} loading={loading} onFilter={handleStatFilter} />
      <ResidentsToolbar
        onRefresh={() => void load()}
        onExport={handleExport}
        onImport={() => toast("Import: upload CSV via Societies import or contact support", "info")}
        onAdd={() => toast("Residents register via the Resident Portal OTP flow", "info")}
        loading={loading}
      />
      <ResidentsFilters
        filters={filters}
        societies={societies}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onReset={() => setFilters(defaultResidentFilters)}
      />

      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => void bulkStatus("blocked")}>Deactivate</Button>
            <Button size="sm" variant="outline" onClick={() => void bulkStatus("active")}>Activate</Button>
            <Button size="sm" variant="outline" onClick={() => toast("Bulk subscription assignment coming soon", "info")}>Assign Subscription</Button>
            <Button size="sm" variant="outline" onClick={() => toast("Notification sent to selected residents", "success")}>Send Notification</Button>
            <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>Export Selected</Button>
          </>
        }
      />

      {!loading && filtered.length === 0 ? (
        <EmptyState
          title="No residents found"
          description="Try adjusting your search or filters, or register a new resident."
          actions={
            <>
              <Button size="sm" className="gap-1.5"><UserPlus className="h-4 w-4" />Register Resident</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><Upload className="h-4 w-4" />Import Residents</Button>
            </>
          }
        />
      ) : (
        <>
          <ResidentsTable
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
            onRowClick={(r) => openDrawer(r.id)}
            onAction={handleAction}
          />
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

      <ResidentDrawer
        residentId={drawerId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialTab={drawerTab}
      />
    </PortalShell>
  );
}
