"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type Filter = "today" | "upcoming" | "completed" | "cancelled";

type PickupRow = {
  id: string;
  status: string;
  scheduled_for: string;
  resident_name: string;
  phone: string;
  society_name: string;
  tower_block: string | null;
  unit_number: string | null;
  slot_window: string | null;
  start_time: string | null;
  end_time: string | null;
  order_code: string | null;
  order_status: string | null;
  operator_code: string | null;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminPickupsPage() {
  const [filter, setFilter] = useState<Filter>("today");
  const [rows, setRows] = useState<PickupRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/pickups?filter=${filter}`, { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setRows((data.pickups as PickupRow[]) ?? []);
  }, [filter]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Pickups"
      subtitle={`${rows.length} pickups · ${filter}`}
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
          <CardTitle className="text-base">Pickup schedule</CardTitle>
          <CardDescription>Filtered by {filter}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="py-2">Scheduled</th>
                <th>Resident</th>
                <th>Society / Unit</th>
                <th>Slot</th>
                <th>Order</th>
                <th>Operator</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2">{new Date(p.scheduled_for).toLocaleString()}</td>
                  <td>
                    <p className="font-medium">{p.resident_name}</p>
                    <p className="text-xs text-muted-foreground">+91 {p.phone}</p>
                  </td>
                  <td>
                    {p.society_name}
                    {p.tower_block || p.unit_number ? ` · ${p.tower_block ?? ""} ${p.unit_number ?? ""}` : ""}
                  </td>
                  <td>
                    {p.slot_window ?? "—"}
                    {p.start_time && p.end_time ? ` (${p.start_time.slice(0, 5)}–${p.end_time.slice(0, 5)})` : ""}
                  </td>
                  <td>{p.order_code ?? "—"} {p.order_status ? `· ${p.order_status}` : ""}</td>
                  <td>{p.operator_code ?? "—"}</td>
                  <td>
                    <Badge>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">No pickups for this filter.</p>}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
