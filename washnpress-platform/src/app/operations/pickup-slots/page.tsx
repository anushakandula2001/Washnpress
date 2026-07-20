"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/frontend/api-client";
import { operationsNav } from "@/lib/portal-nav";

type Society = { id: string; name: string };
type SlotRow = {
  id: string;
  society_id: string;
  slot_date: string;
  window?: string;
  start_time: string;
  end_time: string;
  capacity_total: number;
  capacity_remaining: number;
  is_active?: boolean;
};

const WINDOWS = ["Morning", "Afternoon", "Evening"] as const;
const WINDOW_TIMES: Record<(typeof WINDOWS)[number], { start: string; end: string }> = {
  Morning: { start: "09:00", end: "11:00" },
  Afternoon: { start: "13:00", end: "15:00" },
  Evening: { start: "18:00", end: "20:00" },
};

async function slotsApi(method: string, body?: Record<string, unknown>, params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`/api/operations/slots${qs}`, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`);
  return data;
}

export default function PickupSlotsPage() {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [societyId, setSocietyId] = useState("");
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [slotDate, setSlotDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotWindow, setSlotWindow] = useState<(typeof WINDOWS)[number]>("Morning");
  const [capacity, setCapacity] = useState("20");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (sid?: string) => {
    setLoading(true);
    setError(null);
    try {
      const socData = await api.operationsMaster.get({ type: "societies" });
      const list = ((socData.societies as Society[]) ?? []).map((s) => ({
        id: String(s.id),
        name: String(s.name),
      }));
      setSocieties(list);
      const activeSociety = sid || societyId || list[0]?.id || "";
      if (!societyId && activeSociety) setSocietyId(activeSociety);

      const data = await slotsApi("GET", undefined, activeSociety ? { societyId: activeSociety } : undefined);
      setSlots((data.slots as SlotRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, [societyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createSlot() {
    setMessage(null);
    setError(null);
    if (!societyId) {
      setError("Select a society");
      return;
    }
    const times = WINDOW_TIMES[slotWindow];
    try {
      await slotsApi("POST", {
        societyId,
        slotDate,
        slotWindow,
        startTime: times.start,
        endTime: times.end,
        capacityTotal: Number(capacity) || 20,
      });
      setMessage("Slot created — residents can book it immediately.");
      await load(societyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function toggleActive(slot: SlotRow) {
    try {
      await slotsApi("PATCH", { slotId: slot.id, isActive: !(slot.is_active !== false) });
      await load(societyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function removeSlot(slotId: string) {
    try {
      await slotsApi("DELETE", undefined, { slotId });
      setMessage("Slot removed / disabled.");
      await load(societyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Pickup Slot Management"
      subtitle="Create and manage slots that residents see when scheduling pickups"
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create slot</CardTitle>
            <CardDescription>Available immediately to residents in the selected society.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Society</span>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={societyId}
                onChange={(e) => {
                  setSocietyId(e.target.value);
                  void load(e.target.value);
                }}
              >
                <option value="">Select society</option>
                {societies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Date</span>
              <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Window</span>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={slotWindow}
                onChange={(e) => setSlotWindow(e.target.value as (typeof WINDOWS)[number])}
              >
                {WINDOWS.map((w) => (
                  <option key={w} value={w}>
                    {w} ({WINDOW_TIMES[w].start}–{WINDOW_TIMES[w].end})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Max orders (capacity)</span>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </label>
            <Button className="w-full" onClick={() => void createSlot()}>
              Create slot
            </Button>
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming slots</CardTitle>
            <CardDescription>
              {loading ? "Loading…" : `${slots.length} slot(s) for selected society`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {slots.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground">No slots yet. Create one to open booking.</p>
            ) : null}
            {slots.map((slot) => {
              const active = slot.is_active !== false;
              return (
                <div
                  key={slot.id}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {slot.slot_date} · {slot.window ?? "Window"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {String(slot.start_time).slice(0, 5)}–{String(slot.end_time).slice(0, 5)} ·{" "}
                      {slot.capacity_remaining}/{slot.capacity_total} remaining
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={active ? "default" : "secondary"}>
                      {active ? "Active" : "Disabled"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => void toggleActive(slot)}>
                      {active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void removeSlot(slot.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
