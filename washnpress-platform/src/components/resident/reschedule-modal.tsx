"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResident } from "@/components/resident/resident-provider";
import { api } from "@/frontend/api-client";
import type { ResidentPickup } from "@/lib/resident-data";
import type { TimeWindow } from "@/lib/types";

type SlotOption = {
  id: string;
  date: string;
  window: TimeWindow;
  startTime24h: string;
  endTime24h: string;
  remainingCapacity: number;
};

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
  const { reschedulePickup, refresh } = useResident();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotOption[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlotId(null);
    (async () => {
      try {
        const data = await api.schedule.listSlots();
        if (cancelled) return;
        setSlots(
          data.slots.filter((s) => s.remainingCapacity > 0).map((s) => ({
            ...s,
            window: s.window as TimeWindow,
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setError(err instanceof Error ? err.message : "Failed to load slots");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function handleConfirm() {
    const slot = slots.find((s) => s.id === selectedSlotId);
    if (!slot) return;

    setLoading(true);
    setError(null);
    try {
      const data = (await api.schedule.book({
        slotId: slot.id,
        book: true,
        preferredWindows: [slot.window],
      })) as { slot?: Partial<SlotOption>; pickup?: { id: string } };

      const confirmed = data.slot ?? slot;
      const newPickup: ResidentPickup = {
        id: data.pickup?.id ?? `pickup-${Date.now()}`,
        date: confirmed.date ?? slot.date,
        startTime: confirmed.startTime24h ?? slot.startTime24h,
        endTime: confirmed.endTime24h ?? slot.endTime24h,
        window: (confirmed.window as string) ?? slot.window,
        status: "scheduled",
      };
      reschedulePickup(newPickup);
      await refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reschedule failed");
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
        {error && (
          <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mb-4 max-h-64 space-y-2 overflow-auto">
          {loadingSlots ? (
            <p className="text-sm text-muted-foreground">Loading slots…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available slots right now.</p>
          ) : (
            slots.map((slot) => (
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
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={!selectedSlotId || loading || loadingSlots}
          >
            {loading ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
