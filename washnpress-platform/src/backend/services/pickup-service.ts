import { choosePickupSlot } from "@/lib/domain";
import {
  listSlotsBySociety,
  listAllSlotsBySociety,
  findSlotById,
  decrementSlotCapacity,
  createPickup,
  findNextPickup,
  reschedulePickup,
} from "@/backend/repositories/pickups";
import { createOrderForPickup } from "@/backend/repositories/orders";
import {
  createResidentNotification,
  notifySocietyOperators,
} from "@/backend/repositories/notifications";
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

export async function listResidentSlots(societyId: string) {
  // Only operator/admin-created available slots — never auto-generate static windows
  const slots = await listSlotsBySociety(societyId);
  return slots.map(toPickupSlot);
}

export async function listManagedSlots(societyId: string) {
  return listAllSlotsBySociety(societyId);
}

export async function bookPickup(data: {
  residentId: string;
  societyId: string;
  slotId: string;
  specialInstructions?: string;
  recurring?: boolean;
  garmentCount?: number;
  items?: { category: string; quantity: number }[];
}) {
  const slot = await findSlotById(data.slotId);
  if (!slot || slot.capacity_remaining <= 0) {
    throw new Error("Slot not available");
  }
  if (slot.is_active === false) {
    throw new Error("Slot is disabled");
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

  if (!pickup?.id) throw new Error("Failed to create pickup");

  const order = await createOrderForPickup({
    pickupId: pickup.id,
    garmentCount: data.garmentCount,
    items: data.items,
  });

  await decrementSlotCapacity(data.slotId);

  const windowLabel = slot.window ?? "slot";
  await createResidentNotification(
    data.residentId,
    "Pickup booked successfully",
    `Your pickup is confirmed for ${slot.slot_date} (${windowLabel}). Order ${order.order_code}.`,
  );

  await notifySocietyOperators(
    data.societyId,
    "New pickup scheduled",
    `Order ${order.order_code} booked for ${slot.slot_date} ${slot.start_time}.`,
    order.order_code,
  );

  return { pickup, slot, order };
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
