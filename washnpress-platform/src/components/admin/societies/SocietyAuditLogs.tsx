"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import type { AuditLogRow } from "./types";

export function SocietyAuditLogs({ societyId }: { societyId: string }) {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/audit-logs?limit=100", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const all = (d.logs as AuditLogRow[]) ?? [];
        setLogs(
          all.filter(
            (l) =>
              l.entity_id === societyId ||
              (l.entity_name === "societies" && l.entity_id === societyId),
          ),
        );
      })
      .catch(() => null)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [societyId]);

  if (loading) return <Skeleton className="h-48 rounded-xl" />;

  if (logs.length === 0) {
    return <EmptyState title="No audit logs" description="Changes to this society will be recorded here." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Audit Trail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {logs.map((l) => (
          <div key={l.id} className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium capitalize">{l.action.replace(/_/g, " ")}</span>
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">By {l.actor_role} · {l.entity_name}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
