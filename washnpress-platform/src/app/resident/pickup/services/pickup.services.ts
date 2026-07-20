import { api } from "@/frontend/api-client";
import type { TimeWindow } from "@/lib/types";
import type { ResidentPickup } from "@/lib/resident-data";
import type { PickupSlotOption, SlotAvailability } from "../_types/pickup.types";

function availabilityFromCapacity(remaining: number): SlotAvailability {
  if (remaining <= 0) return "booked";
  if (remaining <= 2) return "few";
  return "available";
}

function formatLabel(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export async function fetchPickupSlots(): Promise<PickupSlotOption[]> {
  const data = await api.schedule.listSlots();
  return data.slots.map((slot) => ({
    id: slot.id,
    date: slot.date,
    window: slot.window as TimeWindow,
    startTime24h: slot.startTime24h,
    endTime24h: slot.endTime24h,
    remainingCapacity: slot.remainingCapacity,
    availability: availabilityFromCapacity(slot.remainingCapacity),
    label: formatLabel(slot.startTime24h, slot.endTime24h),
  }));
}

export type ConfirmPickupPayload = {
  slot: PickupSlotOption;
  specialInstructions: string;
  serviceIds: string[];
  garmentCounts: Record<string, number>;
};

export async function confirmPickupBooking(
  payload: ConfirmPickupPayload,
): Promise<{ bookingId: string; pickup: ResidentPickup; orderCode: string }> {
  const items = Object.entries(payload.garmentCounts)
    .filter(([, qty]) => qty > 0)
    .map(([category, quantity]) => ({ category, quantity }));
  const garmentCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const data = (await api.schedule.book({
    slotId: payload.slot.id,
    book: true,
    preferredWindows: [payload.slot.window],
    specialInstructions: payload.specialInstructions || undefined,
    garmentCount,
    items,
  })) as {
    order?: { id: string; orderCode: string };
    pickup?: Record<string, unknown>;
    slot?: Partial<PickupSlotOption>;
  };

  const orderCode = data.order?.orderCode;
  if (!orderCode) {
    throw new Error("Booking succeeded but no order was returned");
  }

  const confirmed = data.slot ?? payload.slot;
  const pickupId = (data.pickup?.id as string | undefined) ?? orderCode;

  return {
    bookingId: orderCode,
    orderCode,
    pickup: {
      id: pickupId,
      date: (confirmed.date as string) ?? payload.slot.date,
      startTime: (confirmed.startTime24h as string) ?? payload.slot.startTime24h,
      endTime: (confirmed.endTime24h as string) ?? payload.slot.endTime24h,
      window: (confirmed.window as string) ?? payload.slot.window,
      status: "scheduled",
    },
  };
}
