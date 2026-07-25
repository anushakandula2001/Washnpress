"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { useToast } from "@/components/ui/toast";
import { adminNav } from "@/lib/portal-nav";
import { usePagination } from "@/lib/admin/use-pagination";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/admin/export-utils";
import { RoleOverviewStats } from "@/components/admin/roles/RoleOverviewStats";
import { RoleCards } from "@/components/admin/roles/RoleCards";
import { UserRoleDirectory } from "@/components/admin/roles/UserRoleDirectory";
import { UserDetailsDrawer } from "@/components/admin/roles/UserDetailsDrawer";
import { ChangeRoleDialog } from "@/components/admin/roles/ChangeRoleDialog";
import { RoleHistoryCard } from "@/components/admin/roles/RoleHistoryCard";
import { AuditLogSection } from "@/components/admin/roles/AuditLogSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  defaultRoleFilters,
  primaryRole,
  societyLabel,
  type AuditLogRow,
  type PlatformRole,
  type RoleFilters,
  type SocietyOpt,
  type UserRoleRow,
} from "@/components/admin/roles/types";

function normalizeUser(raw: Record<string, unknown>): UserRoleRow {
  const roles = Array.isArray(raw.roles) ? (raw.roles as string[]) : [];
  const societies = Array.isArray(raw.societies) ? (raw.societies as string[]) : [];
  return {
    id: String(raw.id),
    phone: String(raw.phone ?? ""),
    full_name: String(raw.full_name ?? ""),
    email: raw.email ? String(raw.email) : null,
    status: String(raw.status ?? "active"),
    roles,
    societies,
    resident_id: raw.resident_id ? String(raw.resident_id) : null,
    operator_id: raw.operator_id ? String(raw.operator_id) : null,
    last_login_at: raw.last_login_at ? String(raw.last_login_at) : null,
    created_at: raw.created_at ? String(raw.created_at) : undefined,
  };
}

function applyFilters(rows: UserRoleRow[], filters: RoleFilters, societies: SocietyOpt[]): UserRoleRow[] {
  let result = [...rows];
  const q = filters.q.trim().toLowerCase();

  if (q) {
    result = result.filter((u) => {
      const haystack = [
        u.full_name,
        u.phone,
        u.email ?? "",
        ...u.roles,
        societyLabel(u.societies),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (filters.role) {
    result = result.filter((u) => primaryRole(u.roles) === filters.role);
  }

  if (filters.status) {
    result = result.filter((u) => u.status === filters.status);
  }

  if (filters.societyId) {
    const society = societies.find((s) => s.id === filters.societyId);
    if (society) {
      result = result.filter((u) => u.societies?.includes(society.name));
    }
  }

  return result;
}

export default function AdminRolesPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRoleRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [societies, setSocieties] = useState<SocietyOpt[]>([]);
  const [filters, setFilters] = useState<RoleFilters>(defaultRoleFilters);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerUser, setDrawerUser] = useState<UserRoleRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changeUser, setChangeUser] = useState<UserRoleRow | null>(null);
  const [changeOpen, setChangeOpen] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load roles");
      setUsers(((data.users as Array<Record<string, unknown>>) ?? []).map(normalizeUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs?limit=50", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load audit logs");
      setAuditLogs((data.logs as AuditLogRow[]) ?? []);
    } catch {
      setAuditLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
    void loadAuditLogs();
  }, [loadRoles, loadAuditLogs]);

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

  const filtered = useMemo(
    () => applyFilters(users, filters, societies),
    [users, filters, societies],
  );
  const { paginated, from, to, total, page, totalPages, pageSize, goTo, setSize } =
    usePagination(filtered);

  async function handleChangeRole(role: PlatformRole) {
    if (!changeUser) return;
    setSavingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${changeUser.id}/roles`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: [role] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Role update failed");
      toast(`Role updated to ${role}`, "success");
      setChangeOpen(false);
      setChangeUser(null);
      await Promise.all([loadRoles(), loadAuditLogs()]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Role update failed", "error");
    } finally {
      setSavingRole(false);
    }
  }

  async function handleToggleStatus(user: UserRoleRow) {
    const nextStatus = user.status === "active" ? "blocked" : "active";
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Status update failed");
      toast(nextStatus === "active" ? "User activated" : "User deactivated", "success");
      await Promise.all([loadRoles(), loadAuditLogs()]);
      if (drawerUser?.id === user.id) {
        setDrawerUser({ ...user, status: nextStatus });
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Status update failed", "error");
    }
  }

  function handleExport(format: "csv" | "excel" | "pdf") {
    const headers = ["Name", "Phone", "Email", "Role", "Society", "Status", "Last Login", "Registered"];
    const data = filtered.map((u) => [
      u.full_name ?? "",
      u.phone,
      u.email ?? "",
      primaryRole(u.roles),
      societyLabel(u.societies),
      u.status,
      u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "",
      u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
    ]);
    if (format === "csv") exportToCsv("roles-users.csv", headers, data);
    else if (format === "excel") exportToExcel("roles-users.xls", headers, data);
    else exportToPdf("roles-users.pdf", "Roles & Permissions — Users", headers, data);
    toast("Export started", "success");
  }

  function handleStatFilter(filter: string) {
    if (filter === "all") setFilters(defaultRoleFilters);
    else if (filter === "active") setFilters((f) => ({ ...f, status: "active", role: "" }));
    else if (filter === "inactive") setFilters((f) => ({ ...f, status: "blocked", role: "" }));
    else if (["admin", "operator", "resident"].includes(filter)) {
      setFilters((f) => ({ ...f, role: filter, status: "" }));
    }
  }

  function openChangeRole(user: UserRoleRow) {
    setChangeUser(user);
    setChangeOpen(true);
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Roles & Permissions"
      subtitle="Enterprise role access management"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <RoleOverviewStats users={users} loading={loading} onFilter={handleStatFilter} />

      <RoleCards users={users} />

      <div className="mb-6">
        <UserRoleDirectory
          users={paginated}
          societies={societies}
          loading={loading}
          search={filters.q}
          roleFilter={filters.role}
          statusFilter={filters.status}
          societyFilter={filters.societyId}
          onSearchChange={(q) => setFilters((f) => ({ ...f, q }))}
          onRoleFilterChange={(role) => setFilters((f) => ({ ...f, role }))}
          onStatusFilterChange={(status) => setFilters((f) => ({ ...f, status }))}
          onSocietyFilterChange={(societyId) => setFilters((f) => ({ ...f, societyId }))}
          onRefresh={() => void Promise.all([loadRoles(), loadAuditLogs()])}
          onExport={handleExport}
          onView={(user) => {
            setDrawerUser(user);
            setDrawerOpen(true);
          }}
          onChangeRole={openChangeRole}
          onToggleStatus={(user) => void handleToggleStatus(user)}
          from={from}
          to={to}
          total={total}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={goTo}
          onPageSizeChange={setSize}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RoleHistoryCard logs={auditLogs} loading={logsLoading} />
        <AuditLogSection logs={auditLogs} loading={logsLoading} />
      </div>

      <UserDetailsDrawer
        user={drawerUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onChangeRole={(user) => {
          setDrawerOpen(false);
          openChangeRole(user);
        }}
        onToggleStatus={(user) => void handleToggleStatus(user)}
      />

      <ChangeRoleDialog
        user={changeUser}
        open={changeOpen}
        onOpenChange={setChangeOpen}
        onConfirm={handleChangeRole}
        saving={savingRole}
      />
    </PortalShell>
  );
}
