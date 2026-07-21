"use client";

import { History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLogRow } from "./types";
import { isRoleChangeLog } from "./types";

function formatRoles(state: Record<string, unknown> | null | undefined): string {
  if (!state) return "—";
  const roles = state.roles;
  if (Array.isArray(roles)) return roles.join(", ") || "—";
  return "—";
}

export function RoleHistoryCard({
  logs,
  loading,
}: {
  logs: AuditLogRow[];
  loading?: boolean;
}) {
  const roleLogs = logs.filter(isRoleChangeLog);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Role Change History</CardTitle>
            <CardDescription>Recent role assignments and updates</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        {!loading &&
          roleLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                User <span className="font-mono text-xs">{log.entity_id?.slice(0, 8) ?? "—"}</span>
                {log.actor_role && (
                  <>
                    {" "}
                    · by <Badge variant="secondary" className="text-xs capitalize">{log.actor_role}</Badge>
                  </>
                )}
              </p>
              <p className="mt-2 text-xs">
                <span className="text-muted-foreground">From:</span> {formatRoles(log.before_state)}{" "}
                <span className="mx-1 text-muted-foreground">→</span>
                <span className="text-muted-foreground">To:</span> {formatRoles(log.after_state)}
              </p>
            </div>
          ))}
        {!loading && roleLogs.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No role changes recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
