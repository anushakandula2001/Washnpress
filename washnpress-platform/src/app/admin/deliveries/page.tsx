"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type Filter = "ready" | "out" | "delivered" | "failed";

type DeliveryRow = {
  order_code: string;
  status: string;
  updated_at: string;
  pickup_garment_count: number;
  resident_name: string;
  phone: string;
  society_name: string;
  resident_id: string;
  scheduled_for: string;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ready", label: "Ready" },
  { id: "out", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
];

export default function AdminDeliveriesPage() {
  const [filter, setFilter] = useState<Filter>("ready");
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/deliveries?filter=${filter}`, { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setRows((data.deliveries as DeliveryRow[]) ?? []);
  }, [filter]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Deliveries"
      subtitle={`${rows.length} orders · ${filter}`}
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? "default" : "outline"} onClick={() => setFilter(f.id)}>
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery pipeline</CardTitle>
          <CardDescription>Orders in delivery stages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {rows.map((d) => (
            <div key={`${d.order_code}-${d.updated_at}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
              <div>
                <p className="font-medium">{d.order_code}</p>
                <p className="text-muted-foreground">
                  <Link href={`/admin/residents/${d.resident_id}`} className="text-primary hover:underline">
                    {d.resident_name}
                  </Link>
                  {" · "}
                  {d.society_name} · +91 {d.phone} · {d.pickup_garment_count} garments
                </p>
                <p className="text-xs text-muted-foreground">
                  Pickup {new Date(d.scheduled_for).toLocaleDateString()} · Updated {new Date(d.updated_at).toLocaleString()}
                </p>
              </div>
              <Badge>{d.status}</Badge>
            </div>
          ))}
          {rows.length === 0 && <p className="text-muted-foreground">No deliveries for this filter.</p>}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
