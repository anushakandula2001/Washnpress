"use client";

import { useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pickupSlots } from "@/lib/mock-data";
import { choosePickupSlot } from "@/lib/domain";
import { formatPickupDisplay, residentProfile, type ResidentPickup } from "@/lib/resident-data";

function formatSlotLabel(date: string, start: string, end: string, window: string) {
  const d = new Date(`${date}T${start}:00`);
  const day = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };
  return { day, time: `${fmt(start)} – ${fmt(end)}`, window };
}

export default function PickupPage() {
  const { pickup, reschedulePickup } = useResident();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [instructions, setInstructions] = useState("");

  const availableSlots = pickupSlots.filter((s) => s.remainingCapacity > 0);

  async function handleConfirm() {
    const slot = availableSlots.find((s) => s.id === selectedSlotId);
    if (!slot) return;

    setLoading(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredWindows: [slot.window] }),
      });
      const data = await res.json();
      const confirmedSlot = data.slot ?? slot;

      const newPickup: ResidentPickup = {
        id: `pickup-${Date.now()}`,
        date: confirmedSlot.date,
        startTime: confirmedSlot.startTime24h,
        endTime: confirmedSlot.endTime24h,
        window: confirmedSlot.window,
        status: "scheduled",
      };
      reschedulePickup(newPickup);
      setConfirmed(true);
    } catch {
      const fallback = choosePickupSlot(pickupSlots, ["Morning", "Evening"]);
      if (fallback) {
        reschedulePickup({
          id: `pickup-${Date.now()}`,
          date: fallback.date,
          startTime: fallback.startTime24h,
          endTime: fallback.endTime24h,
          window: fallback.window,
          status: "scheduled",
        });
        setConfirmed(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResidentShell greeting="Schedule Pickup" subtitle="Choose your preferred pickup window">
      {confirmed ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Pickup Confirmed!</h2>
            <p className="mt-2 text-muted-foreground">{formatPickupDisplay(pickup)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirmation sent to {residentProfile.mobile} via SMS & WhatsApp
            </p>
            <Button className="mt-4" onClick={() => setConfirmed(false)}>Schedule Another</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Pickup Slot</CardTitle>
              <CardDescription>Available slots for {residentProfile.society}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableSlots.map((slot) => {
                const label = formatSlotLabel(slot.date, slot.startTime24h, slot.endTime24h, slot.window);
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedSlotId === slot.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="font-semibold">{label.day}</p>
                    <p className="text-sm text-muted-foreground">{label.time} · {label.window}</p>
                    <p className="mt-1 text-xs text-primary">{slot.remainingCapacity} slots available</p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pickup Details</CardTitle>
              <CardDescription>Flat {residentProfile.flatNumber}, {residentProfile.tower}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm">
                <span className="text-muted-foreground">Special Instructions</span>
                <Input
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Ring doorbell twice, leave at security"
                  className="mt-1"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Contact Number</span>
                <Input value={residentProfile.mobile} readOnly className="mt-1" />
              </label>
              <Button
                className="w-full"
                onClick={handleConfirm}
                disabled={!selectedSlotId || loading}
              >
                {loading ? "Confirming..." : "Confirm Pickup"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </ResidentShell>
  );
}
