"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatusBadge } from "./StatusBadge";

type Enrollment = {
  id: string;
  status: string;
  tier: string;
  plan_name: string;
  monthly_inr: number;
  full_name: string;
  phone: string;
  cycle_start: string;
  cycle_end: string;
  society_name: string;
};

export function SocietySubscriptions({ societyId, societyName }: { societyId: string; societyName: string }) {
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/subscriptions", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const all = (d.enrollments as Enrollment[]) ?? [];
        setRows(all.filter((e) => e.society_name === societyName));
      })
      .catch(() => null)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [societyId, societyName]);

  if (loading) return <Skeleton className="h-48 rounded-xl" />;

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No subscriptions"
        description="Active resident subscription enrollments at this society will appear here."
        actions={
          <Link href="/admin/subscriptions" className="text-sm text-primary no-underline hover:underline">
            Manage subscription plans
          </Link>
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Subscriptions ({rows.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Resident</th>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Monthly</th>
              <th className="px-4 py-2">Cycle</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-border/60">
                <td className="px-4 py-2">
                  <p className="font-medium">{e.full_name}</p>
                  <p className="text-xs text-muted-foreground">+91 {e.phone}</p>
                </td>
                <td className="px-4 py-2">{e.plan_name ?? e.tier}</td>
                <td className="px-4 py-2">₹{Number(e.monthly_inr).toLocaleString("en-IN")}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {new Date(e.cycle_start).toLocaleDateString()} – {new Date(e.cycle_end).toLocaleDateString()}
                </td>
                <td className="px-4 py-2"><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
