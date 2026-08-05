"use client";

import { readApiJson } from "@/frontend/api-client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { operationsNav } from "@/lib/portal-nav";
import { Loader2 } from "lucide-react";

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
  const data = await readApiJson(res).catch(() => ({} as any));
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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async (sid?: string) => {
    setLoading(true);
    try {
      const data = await slotsApi("GET", undefined, sid ? { societyId: sid } : undefined);
      
      const list = (data.societies as Society[]) ?? [];
      setSocieties(list);
      
      const activeSociety = sid || (list.length === 1 ? list[0].id : societyId) || "";
      if (activeSociety && societyId !== activeSociety) {
        setSocietyId(activeSociety);
      }

      // Filter upcoming slots to hide expired ones
      const now = new Date();
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const upcomingSlots = ((data.slots as SlotRow[]) ?? []).filter(slot => {
        const slotDateObj = new Date(slot.slot_date);
        const slotDateOnly = new Date(slotDateObj.getFullYear(), slotDateObj.getMonth(), slotDateObj.getDate());
        
        if (slotDateOnly.getTime() < todayOnly.getTime()) return false; // Past dates
        if (slotDateOnly.getTime() === todayOnly.getTime()) {
          const startTimeParts = slot.start_time.split(":");
          const startHour = parseInt(startTimeParts[0], 10);
          const startMinute = parseInt(startTimeParts[1], 10);
          if (now.getHours() > startHour || (now.getHours() === startHour && now.getMinutes() >= startMinute)) {
            return false; // Expired today
          }
        }
        return true;
      });

      setSlots(upcomingSlots);
    } catch (err) {
      toast(err instanceof Error ? err.message : "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  }, [societyId, toast]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute available windows dynamically based on current time if date is today
  const availableWindows = useMemo(() => {
    const slotDateObj = new Date(slotDate);
    const now = new Date();
    const slotDateOnly = new Date(slotDateObj.getFullYear(), slotDateObj.getMonth(), slotDateObj.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (slotDateOnly.getTime() > todayOnly.getTime()) return WINDOWS;
    if (slotDateOnly.getTime() < todayOnly.getTime()) return [];

    // Date is today
    return WINDOWS.filter(w => {
      const startTimeParts = WINDOW_TIMES[w].start.split(":");
      const startHour = parseInt(startTimeParts[0], 10);
      const startMinute = parseInt(startTimeParts[1], 10);
      return now.getHours() < startHour || (now.getHours() === startHour && now.getMinutes() < startMinute);
    });
  }, [slotDate]);

  // Reset slotWindow if the current one is not available
  useEffect(() => {
    if (availableWindows.length > 0 && !availableWindows.includes(slotWindow)) {
      setSlotWindow(availableWindows[0]);
    }
  }, [availableWindows, slotWindow]);

  async function createSlot() {
    if (!societyId) {
      toast("Please select a society.", "error");
      return;
    }
    
    if (availableWindows.length === 0 || !availableWindows.includes(slotWindow)) {
      toast("Selected time window is no longer available.", "error");
      return;
    }

    const times = WINDOW_TIMES[slotWindow];
    setIsSaving(true);

    try {
      await slotsApi("POST", {
        societyId,
        slotDate,
        slotWindow,
        startTime: times.start,
        endTime: times.end,
        capacityTotal: Number(capacity) || 20,
      });
      
      toast("Slot created. Residents can book it immediately.", "success");
      
      // Reset form to defaults
      setCapacity("20");
      
      await load(societyId);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create slot.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(slot: SlotRow) {
    try {
      await slotsApi("PATCH", { slotId: slot.id, isActive: !(slot.is_active !== false) });
      await load(societyId);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update slot.", "error");
    }
  }

  async function removeSlot(slotId: string) {
    try {
      await slotsApi("DELETE", undefined, { slotId });
      toast("Slot removed. The slot has been deleted or disabled.", "success");
      await load(societyId);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete slot.", "error");
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);

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
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={societyId}
                disabled={societies.length === 1}
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
              <Input 
                type="date" 
                value={slotDate} 
                min={todayStr}
                onChange={(e) => setSlotDate(e.target.value)} 
              />
            </label>
            
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Window</span>
              {availableWindows.length > 0 ? (
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={slotWindow}
                  onChange={(e) => setSlotWindow(e.target.value as (typeof WINDOWS)[number])}
                >
                  {availableWindows.map((w) => (
                    <option key={w} value={w}>
                      {w} ({WINDOW_TIMES[w].start}–{WINDOW_TIMES[w].end})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  No pickup windows available for selected date
                </div>
              )}
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
            
            <Button 
              className="w-full" 
              onClick={() => void createSlot()} 
              disabled={isSaving || !societyId || availableWindows.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create slot"
              )}
            </Button>
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
