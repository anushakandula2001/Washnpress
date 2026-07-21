"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatusBadge } from "./StatusBadge";
import type { PickupSlot } from "./types";

export function SocietyPickupSlots({ societyId }: { societyId: string }) {
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/slots?societyId=${societyId}`, { credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed");
        if (!cancelled) setSlots((data.slots as PickupSlot[]) ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [societyId]);

  if (loading) return <Skeleton className="h-48 rounded-xl" />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  if (slots.length === 0) {
    return (
      <EmptyState
        title="No pickup slots"
        description="Configure pickup slots for residents to schedule laundry pickups."
        actions={
          <Button size="sm" variant="outline" onClick={() => window.open("/operations/pickup-slots", "_blank")}>
            Manage in Operations
          </Button>
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pickup Slots</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Window</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Capacity</th>
              <th className="px-4 py-2">Remaining</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id} className="border-b border-border/60">
                <td className="px-4 py-2">{new Date(s.slot_date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{s.slot_window}</td>
                <td className="px-4 py-2">{s.start_time} – {s.end_time}</td>
                <td className="px-4 py-2">{s.capacity_total}</td>
                <td className="px-4 py-2">{s.capacity_remaining}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={s.is_active ? "active" : "inactive"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
