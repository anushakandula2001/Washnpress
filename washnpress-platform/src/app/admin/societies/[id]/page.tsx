"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

export default function AdminSocietyDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/admin/societies?id=${params.id}`, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [params.id]);

  const society = data?.society as Record<string, unknown> | undefined;
  const towers = (data?.towers as Array<Record<string, unknown>>) ?? [];
  const operators = (data?.operators as Array<Record<string, unknown>>) ?? [];
  const residents = (data?.residents as Array<Record<string, unknown>>) ?? [];
  const orders = (data?.orders as Array<Record<string, unknown>>) ?? [];

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting={String(society?.name ?? "Society")}
      subtitle="Society network detail"
    >
      <Link href="/admin/societies" className="mb-4 inline-block text-sm text-primary no-underline hover:underline">
        ← Back to societies
      </Link>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {society && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Society information</CardTitle>
              <CardDescription>
                {String(society.city)}, {String(society.state)} {String(society.pincode ?? "")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">{String(society.address_line_1 ?? "—")}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {operators.map((o) => (
                <Link
                  key={String(o.id)}
                  href={`/admin/operators/${String(o.id)}`}
                  className="block rounded-lg border border-border p-2 no-underline hover:bg-muted/40"
                >
                  {String(o.full_name)} · {String(o.operator_code)}
                </Link>
              ))}
              {operators.length === 0 && <p className="text-muted-foreground">Unassigned</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Towers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {towers.map((t) => (
                <div key={String(t.id)} className="rounded-lg border border-border p-2">
                  <p className="font-medium">{String(t.name)}</p>
                  <p className="text-muted-foreground">
                    Floors {String(t.floors_count)} · Flats {String(t.flats_count)} · Residents{" "}
                    {String(t.residents_count)}
                  </p>
                </div>
              ))}
              {towers.length === 0 && <p className="text-muted-foreground">No towers yet</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Residents & orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="mb-1 font-medium">Residents</p>
                {residents.slice(0, 10).map((r) => (
                  <Link
                    key={String(r.id)}
                    href={`/admin/residents/${String(r.id)}`}
                    className="block text-primary no-underline hover:underline"
                  >
                    {String(r.full_name)} · {String(r.tower_block)} {String(r.unit_number)}
                  </Link>
                ))}
              </div>
              <div>
                <p className="mb-1 font-medium">Recent orders</p>
                {orders.map((o) => (
                  <Link
                    key={String(o.order_code)}
                    href={`/admin/orders?order=${String(o.order_code)}`}
                    className="flex justify-between no-underline hover:underline"
                  >
                    <span>{String(o.order_code)}</span>
                    <span>{String(o.status)}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PortalShell>
  );
}
