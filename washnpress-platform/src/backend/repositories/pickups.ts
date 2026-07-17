import { query, queryOne } from "@/backend/db/pool";
import type { DbPickupSlot } from "@/backend/types";

export async function listSlotsBySociety(societyId: string) {
  const result = await query<DbPickupSlot>(
    `SELECT id, society_id, slot_date::text, slot_window AS window, start_time::text, end_time::text,
            capacity_total, capacity_remaining
     FROM pickup_slots
     WHERE society_id = $1 AND slot_date >= CURRENT_DATE AND capacity_remaining > 0
     ORDER BY slot_date ASC, start_time ASC`,
    [societyId],
  );
  return result.rows;
}

export async function findSlotById(slotId: string) {
  return queryOne<DbPickupSlot>(
    `SELECT id, society_id, slot_date::text, slot_window AS window, start_time::text, end_time::text,
            capacity_total, capacity_remaining
     FROM pickup_slots WHERE id = $1`,
    [slotId],
  );
}

export async function decrementSlotCapacity(slotId: string) {
  await query(
    `UPDATE pickup_slots SET capacity_remaining = capacity_remaining - 1
     WHERE id = $1 AND capacity_remaining > 0`,
    [slotId],
  );
}

export async function findNextPickup(residentId: string) {
  return queryOne<{
    id: string;
    scheduled_for: string;
    status: string;
    recurring: boolean;
    special_instructions: string | null;
    slot_date: string | null;
    window: string | null;
    start_time: string | null;
    end_time: string | null;
  }>(
    `SELECT p.id, p.scheduled_for, p.status, p.recurring, p.special_instructions,
            ps.slot_date::text, ps.slot_window AS window, ps.start_time::text, ps.end_time::text
     FROM pickups p
     LEFT JOIN pickup_slots ps ON ps.id = p.pickup_slot_id
     WHERE p.resident_id = $1 AND p.status IN ('scheduled', 'rescheduled')
     ORDER BY p.scheduled_for ASC LIMIT 1`,
    [residentId],
  );
}

export async function createPickup(data: {
  residentId: string;
  societyId: string;
  slotId: string;
  scheduledFor: Date;
  specialInstructions?: string;
  recurring?: boolean;
}) {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO pickups (resident_id, society_id, pickup_slot_id, scheduled_for, status, recurring, special_instructions)
     VALUES ($1, $2, $3, $4, 'scheduled', $5, $6) RETURNING id`,
    [
      data.residentId,
      data.societyId,
      data.slotId,
      data.scheduledFor.toISOString(),
      data.recurring ?? false,
      data.specialInstructions ?? null,
    ],
  );
  return result;
}

export async function reschedulePickup(
  pickupId: string,
  slotId: string,
  scheduledFor: Date,
) {
  await query(
    `UPDATE pickups SET pickup_slot_id = $2, scheduled_for = $3, status = 'rescheduled', updated_at = now()
     WHERE id = $1`,
    [pickupId, slotId, scheduledFor.toISOString()],
  );
}
