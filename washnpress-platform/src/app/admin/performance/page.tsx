"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type OperatorMetric = {
  id: string;
  operator_code: string;
  full_name: string;
  phone: string;
  status: string;
  societies: string[];
  residents_count: number;
  completed_orders: number;
  pending_orders: number;
  avg_rating: number;
  todays_pickups: number;
};

export default function AdminPerformancePage() {
  const [operators, setOperators] = useState<OperatorMetric[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/performance", { credentials: "same-origin" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed");
        setOperators((data.operators as OperatorMetric[]) ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Operator Performance"
      subtitle={`${operators.length} operators tracked`}
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance metrics</CardTitle>
          <CardDescription>Orders, ratings, and pickup reliability</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="py-2">Operator</th>
                <th>Societies</th>
                <th>Residents</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Avg rating</th>
                <th>Today&apos;s pickups</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((o) => (
                <tr key={o.id} className="border-b border-border/60">
                  <td className="py-2">
                    <Link href={`/admin/operators/${o.id}`} className="font-medium text-primary hover:underline">
                      {o.operator_code}
                    </Link>
                    <p className="text-xs text-muted-foreground">{o.full_name} · +91 {o.phone}</p>
                  </td>
                  <td className="max-w-[180px] truncate">{Array.isArray(o.societies) ? o.societies.join(", ") : "—"}</td>
                  <td>{o.residents_count}</td>
                  <td>{o.completed_orders}</td>
                  <td>{o.pending_orders}</td>
                  <td>{Number(o.avg_rating).toFixed(1)}</td>
                  <td>{o.todays_pickups}</td>
                  <td>
                    <Badge variant={o.status === "active" ? "success" : "secondary"}>{o.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {operators.length === 0 && <p className="py-4 text-sm text-muted-foreground">No operator data.</p>}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
