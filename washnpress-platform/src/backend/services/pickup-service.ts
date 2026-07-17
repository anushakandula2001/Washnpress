import { choosePickupSlot } from "@/lib/domain";
import { listSlotsBySociety, findSlotById, decrementSlotCapacity, createPickup, findNextPickup, reschedulePickup } from "@/backend/repositories/pickups";
import { toPickupSlot } from "@/backend/api/transformers";
import type { TimeWindow } from "@/lib/types";

export async function selectPickupSlot(
  societyId: string,
  preferredWindows: TimeWindow[] = [],
  now = new Date(),
) {
  const slots = await listSlotsBySociety(societyId);
  const mapped = slots.map(toPickupSlot);
  const selected = choosePickupSlot(mapped, preferredWindows, now);
  return selected ? slots.find((s) => s.id === selected.id) : undefined;
}

export async function bookPickup(data: {
  residentId: string;
  societyId: string;
  slotId: string;
  specialInstructions?: string;
  recurring?: boolean;
}) {
  const slot = await findSlotById(data.slotId);
  if (!slot || slot.capacity_remaining <= 0) {
    throw new Error("Slot not available");
  }

  const scheduledFor = new Date(`${slot.slot_date}T${slot.start_time}`);
  const pickup = await createPickup({
    residentId: data.residentId,
    societyId: data.societyId,
    slotId: data.slotId,
    scheduledFor,
    specialInstructions: data.specialInstructions,
    recurring: data.recurring,
  });

  await decrementSlotCapacity(data.slotId);
  return { pickup, slot };
}

export async function rescheduleResidentPickup(
  residentId: string,
  slotId: string,
) {
  const current = await findNextPickup(residentId);
  if (!current) throw new Error("No scheduled pickup found");

  const slot = await findSlotById(slotId);
  if (!slot || slot.capacity_remaining <= 0) {
    throw new Error("Slot not available");
  }

  const scheduledFor = new Date(`${slot.slot_date}T${slot.start_time}`);
  await reschedulePickup(current.id, slotId, scheduledFor);
  await decrementSlotCapacity(slotId);

  return slot;
}
