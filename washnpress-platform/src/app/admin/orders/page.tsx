"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminNav } from "@/lib/portal-nav";

type OrderRow = {
  id: string;
  order_code: string;
  status: string;
  resident_name: string;
  society_name: string;
  society_id: string;
  resident_id: string;
  operator_code: string | null;
};

export default function AdminOrdersPage() {
  const [focus, setFocus] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFocus(params.get("order"));
  }, []);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/orders?${params}`, { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setOrders((data.orders as OrderRow[]) ?? []);
  }, [q, status]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  useEffect(() => {
    if (!focus) {
      setDetail(null);
      return;
    }
    void fetch(`/api/admin/orders?orderCode=${focus}`, { credentials: "same-origin" })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) setDetail(data);
      })
      .catch(() => null);
  }, [focus]);

  const events = (detail?.events as Array<Record<string, unknown>>) ?? [];
  const order = detail?.order as Record<string, unknown> | undefined;

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Orders"
      subtitle="Cross-portal order oversight from PostgreSQL"
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Card className="mb-4">
        <CardContent className="grid gap-2 p-4 sm:grid-cols-2">
          <Input placeholder="Search order, resident, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input placeholder="Status filter" value={status} onChange={(e) => setStatus(e.target.value)} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All orders</CardTitle>
            <CardDescription>{orders.length} loaded</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto text-sm">
            {orders.map((o) => (
              <button
                key={o.id}
                type="button"
                className="block w-full rounded-xl border border-border p-3 text-left hover:bg-muted/40"
                onClick={() => {
                  setFocus(o.order_code);
                  window.history.replaceState(null, "", `/admin/orders?order=${o.order_code}`);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{o.order_code}</span>
                  <Badge>{o.status}</Badge>
                </div>
                <p className="text-muted-foreground">
                  <Link href={`/admin/residents/${o.resident_id}`} className="hover:underline">
                    {o.resident_name}
                  </Link>{" "}
                  ·{" "}
                  <Link href={`/admin/societies/${o.society_id}`} className="hover:underline">
                    {o.society_name}
                  </Link>
                  {o.operator_code ? ` · ${o.operator_code}` : ""}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order detail</CardTitle>
            <CardDescription>{focus ?? "Select an order"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!order && <p className="text-muted-foreground">No order selected.</p>}
            {order && (
              <>
                <p>
                  Resident:{" "}
                  <Link
                    href={`/admin/residents/${String(order.resident_uuid ?? order.resident_id)}`}
                    className="text-primary hover:underline"
                  >
                    {String(order.resident_name)}
                  </Link>
                </p>
                <p>
                  Society:{" "}
                  <Link
                    href={`/admin/societies/${String(order.society_uuid ?? order.society_id)}`}
                    className="text-primary hover:underline"
                  >
                    {String(order.society_name)}
                  </Link>
                </p>
                <p>Status: {String(order.status)}</p>
                <p>Garments: {String(order.pickup_garment_count)}</p>
                <p className="font-medium">Timeline</p>
                <ul className="space-y-2">
                  {events.map((e) => (
                    <li key={String(e.id)} className="rounded-lg border border-border px-3 py-2">
                      <p>{String(e.event_type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(String(e.created_at)).toLocaleString()} ·{" "}
                        {JSON.stringify(e.event_payload)}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
