"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type SocietyRow = {
  id: string;
  name: string;
  address_line_1: string | null;
  city: string;
  state: string;
  pincode: string | null;
  towers_count: number;
  flats_count: number;
  residents_count: number;
  orders_count: number;
  wallet_revenue: number;
  subscriptions_count: number;
  assigned_operators: string | null;
};

export default function AdminSocietiesPage() {
  const [rows, setRows] = useState<SocietyRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/societies", { credentials: "same-origin" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed");
        setRows((data.societies as SocietyRow[]) ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Societies"
      subtitle={`${rows.length} societies in the network`}
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((s) => (
          <Link key={s.id} href={`/admin/societies/${s.id}`} className="no-underline">
            <Card className="h-full transition hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-base">{s.name}</CardTitle>
                <CardDescription>
                  {s.city}, {s.state} {s.pincode ?? ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{s.address_line_1 ?? "No address"}</p>
                <p>Operator: {s.assigned_operators ?? "Unassigned"}</p>
                <p>
                  Towers {s.towers_count} · Flats {s.flats_count} · Residents {s.residents_count}
                </p>
                <p>
                  Orders {s.orders_count} · Subs {s.subscriptions_count} · Wallet ₹
                  {Number(s.wallet_revenue ?? 0).toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
