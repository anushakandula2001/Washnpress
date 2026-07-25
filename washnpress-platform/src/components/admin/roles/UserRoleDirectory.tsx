"use client";

import {
  Download,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  UserCog,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/admin/shared/Avatar";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatusBadge } from "./StatusBadge";
import { Pagination } from "./Pagination";
import {
  ROLE_META,
  societyLabel,
  type PlatformRole,
  type SocietyOpt,
  type UserRoleRow,
  primaryRole,
} from "./types";

export function UserRoleDirectory({
  users,
  societies,
  loading,
  search,
  roleFilter,
  statusFilter,
  societyFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onSocietyFilterChange,
  onRefresh,
  onExport,
  onView,
  onChangeRole,
  onToggleStatus,
  from,
  to,
  total,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  users: UserRoleRow[];
  societies: SocietyOpt[];
  loading?: boolean;
  search: string;
  roleFilter: string;
  statusFilter: string;
  societyFilter: string;
  onSearchChange: (v: string) => void;
  onRoleFilterChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onSocietyFilterChange: (v: string) => void;
  onRefresh: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onView: (user: UserRoleRow) => void;
  onChangeRole: (user: UserRoleRow) => void;
  onToggleStatus: (user: UserRoleRow) => void;
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-10"
            placeholder="Search by name, phone, role, or society…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport("csv")}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("excel")}>Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="resident">Resident</option>
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="deleted">Deleted</option>
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={societyFilter}
          onChange={(e) => onSocietyFilterChange(e.target.value)}
        >
          <option value="">All societies</option>
          {societies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No users found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Society</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Last Login</th>
                  <th className="px-3 py-3">Registered</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const role = primaryRole(user.roles) as PlatformRole;
                  return (
                    <tr
                      key={user.id}
                      className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/30"
                      onClick={() => onView(user)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={user.full_name} size="sm" />
                          <div>
                            <p className="font-medium">{user.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{user.email || user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">+91 {user.phone}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="secondary" className="capitalize">
                          {ROLE_META[role]?.label ?? role}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 max-w-[200px] truncate" title={societyLabel(user.societies)}>
                        {societyLabel(user.societies)}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangeRole(user)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                              {user.status === "active" ? (
                                <>
                                  <UserMinus className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              from={from}
              to={to}
              total={total}
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
