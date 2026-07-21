"use client";

import { ScrollText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLogRow } from "./types";

export function AuditLogSection({
  logs,
  loading,
}: {
  logs: AuditLogRow[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Audit Trail</CardTitle>
            <CardDescription>Latest admin and system actions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-[420px] space-y-2 overflow-y-auto">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        {!loading &&
          logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {log.action.replace(/_/g, " ")} · {log.entity_name}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                {log.entity_id && (
                  <span className="font-mono text-xs">{String(log.entity_id).slice(0, 12)}</span>
                )}
                {log.actor_role && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {log.actor_role}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        {!loading && logs.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No audit logs yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
