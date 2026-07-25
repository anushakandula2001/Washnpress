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
import { OperatorStats } from "@/components/admin/operators/OperatorStats";
import { OperatorToolbar } from "@/components/admin/operators/OperatorToolbar";
import { OperatorFilters } from "@/components/admin/operators/OperatorFilters";
import { OperatorTable } from "@/components/admin/operators/OperatorTable";
import { OperatorDrawer } from "@/components/admin/operators/OperatorDrawer";
import { CreateOperatorWizard } from "@/components/admin/operators/CreateOperatorWizard";
import { AssignSocietyDialog } from "@/components/admin/operators/AssignSocietyDialog";
import { TransferOperatorDialog } from "@/components/admin/operators/TransferOperatorDialog";
import { Pagination } from "@/components/admin/operators/Pagination";
import {
  defaultOperatorFilters,
  type OperatorFilters as OperatorFiltersType,
  type OperatorRow,
  type SocietyOpt,
} from "@/components/admin/operators/types";
import { UserPlus } from "lucide-react";

function normalizeRow(raw: Record<string, unknown>): OperatorRow {
  return {
    id: String(raw.id),
    operator_code: raw.operator_code ? String(raw.operator_code) : null,
    full_name: String(raw.full_name ?? ""),
    phone: String(raw.phone ?? ""),
    email: raw.email ? String(raw.email) : null,
    status: String(raw.status ?? "active"),
    user_status: raw.user_status ? String(raw.user_status) : undefined,
    city: raw.city ? String(raw.city) : null,
    state: raw.state ? String(raw.state) : null,
    pincode: raw.pincode ? String(raw.pincode) : null,
    address_line_1: raw.address_line_1 ? String(raw.address_line_1) : null,
    societies: Array.isArray(raw.societies) ? raw.societies.map(String) : [],
    society_ids: Array.isArray(raw.society_ids) ? raw.society_ids.map(String) : [],
    residents_count: Number(raw.residents_count ?? 0),
    orders_managed: Number(raw.orders_managed ?? 0),
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    joined_at: raw.joined_at ? String(raw.joined_at) : null,
    last_login_at: raw.last_login_at ? String(raw.last_login_at) : null,
  };
}

function applyClientFilters(rows: OperatorRow[], filters: OperatorFiltersType): OperatorRow[] {
  let result = [...rows];

  if (filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    result = result.filter((r) => {
      const hay = `${r.full_name} ${r.phone} ${r.operator_code ?? ""} ${r.email ?? ""} ${r.city ?? ""} ${r.societies.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (filters.societyId === "__unassigned__") {
    result = result.filter((r) => !r.societies.length);
  } else if (filters.societyId) {
    result = result.filter((r) => r.society_ids?.includes(filters.societyId));
  }

  if (filters.status) {
    result = result.filter((r) => r.status === filters.status);
  }

  if (filters.city) {
    result = result.filter((r) => (r.city ?? "").toLowerCase() === filters.city.toLowerCase());
  }

  if (filters.joinedFrom) {
    result = result.filter((r) => (r.created_at ?? r.joined_at ?? "") >= filters.joinedFrom);
  }
  if (filters.joinedTo) {
    result = result.filter((r) => (r.created_at ?? r.joined_at ?? "") <= filters.joinedTo + "T23:59:59");
  }

  switch (filters.sortBy) {
    case "oldest":
      result.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
      break;
    case "name":
      result.sort((a, b) => a.full_name.localeCompare(b.full_name));
      break;
    case "z-a":
      result.sort((a, b) => b.full_name.localeCompare(a.full_name));
      break;
    case "residents":
      result.sort((a, b) => (b.residents_count ?? 0) - (a.residents_count ?? 0));
      break;
    case "orders":
      result.sort((a, b) => (b.orders_managed ?? 0) - (a.orders_managed ?? 0));
      break;
    case "societies":
      result.sort((a, b) => b.societies.length - a.societies.length);
      break;
    case "performance":
      result.sort((a, b) => (b.orders_managed ?? 0) - (a.orders_managed ?? 0));
      break;
    default:
      result.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  }

  return result;
}

export default function OperatorsAdminPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<OperatorRow[]>([]);
  const [societies, setSocieties] = useState<SocietyOpt[]>([]);
  const [filters, setFilters] = useState<OperatorFiltersType>(defaultOperatorFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState("profile");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [dialogOperatorId, setDialogOperatorId] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/operators", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setRows(((data.operators as Array<Record<string, unknown>>) ?? []).map(normalizeRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cities = useMemo(
    () => [...new Set(rows.map((r) => r.city).filter(Boolean) as string[])].sort(),
    [rows],
  );

  const filtered = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);

  const dialogOperator = rows.find((r) => r.id === dialogOperatorId);

  function openDrawer(id: string, tab = "profile") {
    setDrawerId(id);
    setDrawerTab(tab);
    setDrawerOpen(true);
  }

  function openAssign(id: string) {
    setDialogOperatorId(id);
    setAssignOpen(true);
  }

  function openTransfer(id: string) {
    setDialogOperatorId(id);
    setTransferOpen(true);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/operators", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operatorId: id, status }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast(data.message ?? "Update failed", "error");
      return;
    }
    toast(status === "active" ? "Operator activated" : "Operator deactivated", "success");
    await load();
  }

  async function bulkStatus(status: string) {
    await Promise.all([...selected].map((id) => updateStatus(id, status)));
    setSelected(new Set());
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const headers = [
      "Operator ID",
      "Name",
      "Phone",
      "Email",
      "City",
      "Societies",
      "Residents",
      "Orders",
      "Status",
      "Last Login",
      "Joined",
    ];
    const data = filtered.map((r) => [
      r.operator_code ?? r.id,
      r.full_name,
      r.phone,
      r.email ?? "",
      r.city ?? "",
      r.societies.join("; "),
      String(r.residents_count ?? 0),
      String(r.orders_managed ?? 0),
      r.status,
      r.last_login_at ? new Date(r.last_login_at).toLocaleDateString() : "",
      r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
    ]);
    if (format === "csv") exportToCsv("operators.csv", headers, data);
    else if (format === "excel") exportToExcel("operators.xls", headers, data);
    else exportToPdf("operators.pdf", "Operators", headers, data);
    toast("Export started", "success");
  }

  function handleAction(action: string, row: OperatorRow) {
    switch (action) {
      case "view":
      case "edit":
        openDrawer(row.id, "profile");
        break;
      case "societies":
      case "assign":
        openDrawer(row.id, "societies");
        if (action === "assign") openAssign(row.id);
        break;
      case "transfer":
        openDrawer(row.id, "societies");
        openTransfer(row.id);
        break;
      case "residents":
        openDrawer(row.id, "residents");
        break;
      case "orders":
        openDrawer(row.id, "orders");
        break;
      case "performance":
        openDrawer(row.id, "performance");
        break;
      case "notifications":
        openDrawer(row.id, "notifications");
        break;
      case "deactivate":
        void updateStatus(row.id, "inactive");
        break;
    }
  }

  function handleStatFilter(filter: string) {
    if (filter === "active") setFilters((f) => ({ ...f, status: "active" }));
    else if (filter === "inactive") setFilters((f) => ({ ...f, status: "inactive" }));
    else if (filter === "unassigned") {
      setFilters(defaultOperatorFilters);
      setRows((prev) => prev);
      toast("Showing operators with no society assignments", "info");
      setFilters((f) => ({ ...f, societyId: "__unassigned__" }));
    } else setFilters(defaultOperatorFilters);
  }

  const pagination = usePagination(filtered);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Operators"
      subtitle="Create operators and manage society assignments across the platform."
    >
      {createdCode && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Operator created. Operator ID: <strong>{createdCode}</strong>. They can login via OTP on /login.
        </div>
      )}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <OperatorStats rows={rows} loading={loading} onFilter={handleStatFilter} />
      <OperatorToolbar
        onRefresh={() => void load()}
        onExport={handleExport}
        onCreate={() => setWizardOpen(true)}
        loading={loading}
      />
      <OperatorFilters
        filters={filters}
        societies={societies}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onReset={() => setFilters(defaultOperatorFilters)}
      />

      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => void bulkStatus("inactive")}>
              Deactivate
            </Button>
            <Button size="sm" variant="outline" onClick={() => void bulkStatus("active")}>
              Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>
              Export Selected
            </Button>
          </>
        }
      />

      {!loading && filtered.length === 0 ? (
        <EmptyState
          title="No operators found"
          description="Try adjusting your search or filters, or create a new operator."
          actions={
            <Button size="sm" className="gap-1.5" onClick={() => setWizardOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Create Operator
            </Button>
          }
        />
      ) : (
        <>
          <OperatorTable
            rows={pagination.paginated}
            loading={loading}
            selected={selected}
            onSelect={(id, checked) => {
              const next = new Set(selected);
              if (checked) next.add(id);
              else next.delete(id);
              setSelected(next);
            }}
            onSelectAll={(checked) =>
              setSelected(checked ? new Set(pagination.paginated.map((r) => r.id)) : new Set())
            }
            onRowClick={(r) => openDrawer(r.id)}
            onAction={handleAction}
          />
          <Pagination
            from={pagination.from}
            to={pagination.to}
            total={pagination.total}
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            onPageChange={pagination.goTo}
            onPageSizeChange={pagination.setSize}
          />
        </>
      )}

      <OperatorDrawer
        operatorId={drawerId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialTab={drawerTab}
        onAssignSociety={openAssign}
        onTransfer={openTransfer}
        onRefreshList={() => void load()}
      />

      <CreateOperatorWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        societies={societies}
        onSuccess={(code) => {
          setCreatedCode(code);
          void load();
        }}
      />

      <AssignSocietyDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        operatorId={dialogOperatorId}
        operatorName={dialogOperator?.full_name}
        societies={societies}
        assignedIds={dialogOperator?.society_ids ?? []}
        onSuccess={() => void load()}
      />

      <TransferOperatorDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        operatorId={dialogOperatorId}
        operatorName={dialogOperator?.full_name}
        societies={societies}
        assignedIds={dialogOperator?.society_ids ?? []}
        onSuccess={() => void load()}
      />
    </PortalShell>
  );
}
