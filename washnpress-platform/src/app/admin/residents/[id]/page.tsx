"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

export default function AdminResidentProfilePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/residents?id=${params.id}`, { credentials: "same-origin" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed to load");
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const resident = (data?.resident ?? null) as Record<string, unknown> | null;
  const operators = (data?.operators as Array<Record<string, unknown>>) ?? [];
  const orders = (data?.orders as Array<Record<string, unknown>>) ?? [];
  const tickets = (data?.tickets as Array<Record<string, unknown>>) ?? [];
  const notifications = (data?.notifications as Array<Record<string, unknown>>) ?? [];
  const subscription = data?.subscription as Record<string, unknown> | null;
  const walletTx = (data?.walletTx as Array<Record<string, unknown>>) ?? [];

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting={String(resident?.full_name ?? "Resident profile")}
      subtitle="Full resident record from PostgreSQL"
    >
      <div className="mb-4">
        <Link href="/admin/residents" className="text-sm text-primary no-underline hover:underline">
          ← Back to residents
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {!resident && !error && <p className="text-sm text-muted-foreground">Loading…</p>}

      {resident && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>{String(resident.resident_code ?? resident.id)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Phone: +91 {String(resident.phone)}</p>
              <p>Email: {String(resident.email ?? "—")}</p>
              <p>
                Society:{" "}
                <Link
                  href={`/admin/societies/${String(resident.society_id)}`}
                  className="text-primary no-underline hover:underline"
                >
                  {String(resident.society_name)}
                </Link>
              </p>
              <p>
                Tower / Flat: {String(resident.tower_name ?? resident.tower_block ?? "—")} /{" "}
                {String(resident.flat_number ?? resident.unit_number ?? "—")}
              </p>
              <p>Address: {String(resident.society_address ?? "—")}</p>
              <p>
                Status: <Badge>{String(resident.user_status)}</Badge>
              </p>
              <p>Wallet: ₹{Number(resident.wallet_balance ?? 0).toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned operators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {operators.length === 0 && <p className="text-muted-foreground">None assigned</p>}
              {operators.map((op) => (
                <Link
                  key={String(op.id)}
                  href={`/admin/operators/${String(op.id)}`}
                  className="block rounded-lg border border-border p-2 no-underline hover:bg-muted/40"
                >
                  {String(op.full_name)} · {String(op.operator_code)} · +91 {String(op.phone)}
                </Link>
              ))}
              <div className="pt-2">
                <p className="text-muted-foreground">Subscription</p>
                <p className="font-medium">
                  {subscription
                    ? `${String(subscription.tier)} · ${String(subscription.status)} · ₹${subscription.monthly_inr}`
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {orders.map((o) => (
                <Link
                  key={String(o.order_code)}
                  href={`/admin/orders?order=${String(o.order_code)}`}
                  className="flex justify-between rounded-lg border border-border px-3 py-2 no-underline hover:bg-muted/40"
                >
                  <span>{String(o.order_code)}</span>
                  <span>{String(o.status)}</span>
                </Link>
              ))}
              {orders.length === 0 && <p className="text-muted-foreground">No orders</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wallet · Support · Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="mb-1 font-medium">Wallet transactions</p>
                {walletTx.slice(0, 5).map((t, i) => (
                  <p key={i} className="text-muted-foreground">
                    {String(t.type)} ₹{Number(t.amount_inr)} — {String(t.description)}
                  </p>
                ))}
                {walletTx.length === 0 && <p className="text-muted-foreground">None</p>}
              </div>
              <div>
                <p className="mb-1 font-medium">Tickets</p>
                {tickets.map((t) => (
                  <p key={String(t.id)}>
                    {String(t.ticket_code)} · {String(t.status)} · {String(t.category)}
                  </p>
                ))}
                {tickets.length === 0 && <p className="text-muted-foreground">None</p>}
              </div>
              <div>
                <p className="mb-1 font-medium">Notifications</p>
                {notifications.slice(0, 5).map((n) => (
                  <p key={String(n.id)} className="text-muted-foreground">
                    {String(n.title)}
                  </p>
                ))}
                {notifications.length === 0 && <p className="text-muted-foreground">None</p>}
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  View all orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </PortalShell>
  );
}
