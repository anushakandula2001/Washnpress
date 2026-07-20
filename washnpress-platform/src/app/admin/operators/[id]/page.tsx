"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

export default function AdminOperatorProfilePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/operators?id=${params.id}`, { credentials: "same-origin" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Failed to load");
    setData(json);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [params.id]);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      const op = data?.operator as { id: string };
      const res = await fetch("/api/admin/operators", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorId: op.id, status }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message ?? "Update failed");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  const op = data?.operator as Record<string, unknown> | undefined;
  const societies = (data?.societies as Array<Record<string, unknown>>) ?? [];
  const towers = (data?.towers as Array<Record<string, unknown>>) ?? [];
  const stats = (data?.stats as Record<string, number>) ?? {};

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting={String(op?.full_name ?? "Operator profile")}
      subtitle="Operator performance and assignments"
    >
      <div className="mb-4">
        <Link href="/admin/operators" className="text-sm text-primary no-underline hover:underline">
          ← Back to operators
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {op && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{String(op.operator_code)}</CardTitle>
              <CardDescription>+91 {String(op.phone)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Email: {String(op.email ?? op.user_email ?? "—")}</p>
              <p>Address: {String(op.address_line_1 ?? "—")}</p>
              <p>
                {String(op.city ?? "—")}, {String(op.state ?? "—")} {String(op.pincode ?? "")}
              </p>
              <p>
                Status: <Badge variant={op.status === "active" ? "success" : "secondary"}>{String(op.status)}</Badge>
              </p>
              <p>Last login: {op.last_login_at ? new Date(String(op.last_login_at)).toLocaleString() : "Never"}</p>
              <p>Created: {op.created_at ? new Date(String(op.created_at)).toLocaleDateString() : "—"}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void setStatus("inactive")}>
                  Disable
                </Button>
                <Button size="sm" disabled={busy} onClick={() => void setStatus("active")}>
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted-foreground">Residents</p>
                <p className="text-xl font-bold">{stats.residents ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted-foreground">Orders managed</p>
                <p className="text-xl font-bold">{stats.orders ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{stats.completed ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{stats.pending ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned societies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {societies.map((s) => (
                <Link
                  key={String(s.id)}
                  href={`/admin/societies/${String(s.id)}`}
                  className="block rounded-lg border border-border p-2 no-underline hover:bg-muted/40"
                >
                  {String(s.name)} · {String(s.city)}
                </Link>
              ))}
              {societies.length === 0 && <p className="text-muted-foreground">None</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned towers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {towers.map((t) => (
                <p key={String(t.id)}>
                  {String(t.society_name)} · {String(t.name)}
                </p>
              ))}
              {towers.length === 0 && <p className="text-muted-foreground">None</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </PortalShell>
  );
}
