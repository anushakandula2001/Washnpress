"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type HealthResponse = {
  status?: string;
  services?: {
    database?: string;
    redis?: string;
  };
  timestamp?: string;
  environment?: string;
  message?: string;
};

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/health")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Health check failed");
        setHealth(data as HealthResponse);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  }, []);

  const overall = health?.status ?? "unknown";
  const db = health?.services?.database ?? "unknown";
  const redis = health?.services?.redis ?? "unknown";

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="System Health"
      subtitle="Live status from /api/health"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall status</CardTitle>
            <CardDescription>
              Environment is typically development or production — shown here when returned by the health endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Checking services…</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground">Overall</span>
                  <Badge variant={overall === "healthy" ? "success" : "secondary"}>{overall}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground">PostgreSQL</span>
                  <Badge variant={db === "up" ? "success" : "secondary"}>{db}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground">Redis</span>
                  <Badge variant={redis === "up" ? "success" : "secondary"}>{redis}</Badge>
                </div>
                {health?.timestamp && (
                  <p className="text-xs text-muted-foreground">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
                )}
                {health?.environment && (
                  <p className="text-sm">Environment: <span className="font-medium">{health.environment}</span></p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Raw response</CardTitle>
            <CardDescription>Full payload from GET /api/health</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
              {health ? JSON.stringify(health, null, 2) : loading ? "Loading…" : "—"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
