"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/audit-logs", { credentials: "same-origin" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed");
        setLogs((data.logs as Array<Record<string, unknown>>) ?? data.auditLogs ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Audit Logs"
      subtitle="Admin and system actions"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>{logs.length} entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {logs.map((l, i) => (
            <div key={String(l.id ?? i)} className="rounded-xl border border-border p-3">
              <p className="font-medium">
                {String(l.action)} · {String(l.entity_name)}
              </p>
              <p className="text-muted-foreground">
                {l.created_at ? new Date(String(l.created_at)).toLocaleString() : ""} · entity{" "}
                {String(l.entity_id ?? "—")}
              </p>
            </div>
          ))}
          {logs.length === 0 && !error && <p className="text-muted-foreground">No audit logs yet.</p>}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
