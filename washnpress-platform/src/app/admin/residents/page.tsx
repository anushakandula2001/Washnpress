"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminNav } from "@/lib/portal-nav";

type ResidentRow = {
  id: string;
  resident_code: string | null;
  full_name: string | null;
  phone: string;
  email: string | null;
  society_id: string;
  society_name: string;
  tower_name: string | null;
  tower_block: string | null;
  flat_number: string | null;
  unit_number: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  wallet_balance: number;
  orders_count: number;
  created_at: string;
  status: string;
};

type SocietyOpt = { id: string; name: string };

export default function AdminResidentsPage() {
  const [rows, setRows] = useState<ResidentRow[]>([]);
  const [societies, setSocieties] = useState<SocietyOpt[]>([]);
  const [q, setQ] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [tower, setTower] = useState("");
  const [subscription, setSubscription] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (societyId) params.set("societyId", societyId);
    if (tower) params.set("tower", tower);
    if (subscription) params.set("subscription", subscription);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/residents?${params}`, { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed to load");
    setRows((data.residents as ResidentRow[]) ?? []);
  }, [q, societyId, tower, subscription, status]);

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
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function deactivate(id: string) {
    const res = await fetch("/api/admin/residents", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residentId: id, status: "inactive" }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Update failed");
      return;
    }
    await load();
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Residents"
      subtitle="All resident accounts from PostgreSQL"
    >
      <section className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Residents</p>
            <p className="mt-1 text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
      </section>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      <Card className="mb-4">
        <CardContent className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input placeholder="Search name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={societyId}
            onChange={(e) => setSocietyId(e.target.value)}
          >
            <option value="">All societies</option>
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Input placeholder="Tower filter" value={tower} onChange={(e) => setTower(e.target.value)} />
          <Input
            placeholder="Subscription tier"
            value={subscription}
            onChange={(e) => setSubscription(e.target.value)}
          />
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Directory</CardTitle>
          <CardDescription>Click a row for full profile</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Resident ID</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Mobile</th>
                <th className="py-2 pr-3">Society</th>
                <th className="py-2 pr-3">Tower / Flat</th>
                <th className="py-2 pr-3">Subscription</th>
                <th className="py-2 pr-3">Wallet</th>
                <th className="py-2 pr-3">Orders</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/70">
                  <td className="py-2 pr-3 font-mono text-xs">{r.resident_code ?? r.id.slice(0, 8)}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/admin/residents/${r.id}`} className="text-primary no-underline hover:underline">
                      {r.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">+91 {r.phone}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/admin/societies/${r.society_id}`} className="no-underline hover:underline">
                      {r.society_name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">
                    {r.tower_name ?? r.tower_block ?? "—"} / {r.flat_number ?? r.unit_number ?? "—"}
                  </td>
                  <td className="py-2 pr-3">{r.subscription_tier ?? "—"}</td>
                  <td className="py-2 pr-3">₹{Number(r.wallet_balance ?? 0).toLocaleString("en-IN")}</td>
                  <td className="py-2 pr-3">{r.orders_count}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={r.status === "active" ? "success" : "secondary"}>{r.status}</Badge>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      <Link href={`/admin/residents/${r.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => void deactivate(r.id)}>
                        Deactivate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-6 text-sm text-muted-foreground">No residents found.</p>}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
