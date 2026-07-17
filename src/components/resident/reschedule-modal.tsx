"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResident } from "@/components/resident/resident-provider";
import { pickupSlots } from "@/lib/mock-data";
import { choosePickupSlot } from "@/lib/domain";
import type { ResidentPickup } from "@/lib/resident-data";

function formatSlotLabel(date: string, start: string, end: string): string {
  const d = new Date(`${date}T${start}:00`);
  const day = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };
  return `${day}, ${fmt(start)} – ${fmt(end)}`;
}

export function RescheduleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { reschedulePickup } = useResident();
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const availableSlots = pickupSlots.filter((s) => s.remainingCapacity > 0);

  if (!open) return null;

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
      const confirmed = data.slot ?? slot;

      const newPickup: ResidentPickup = {
        id: `pickup-${Date.now()}`,
        date: confirmed.date,
        startTime: confirmed.startTime24h,
        endTime: confirmed.endTime24h,
        window: confirmed.window,
        status: "scheduled",
      };
      reschedulePickup(newPickup);
      onClose();
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
      }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reschedule Pickup</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Select a new pickup slot:</p>
        <div className="mb-4 space-y-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                selectedSlotId === slot.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              }`}
            >
              <p className="font-medium">
                {formatSlotLabel(slot.date, slot.startTime24h, slot.endTime24h)}
              </p>
              <p className="text-xs text-muted-foreground">
                {slot.window} · {slot.remainingCapacity} slots left
              </p>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={!selectedSlotId || loading}
          >
            {loading ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
