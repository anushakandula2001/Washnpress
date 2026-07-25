import { query, queryOne } from "@/backend/db/pool";
import type { DbPickupSlot } from "@/backend/types";

export type DbPickupSlotRow = DbPickupSlot & { is_active?: boolean; slot_window?: string };

export async function listSlotsBySociety(societyId: string) {
  const result = await query<DbPickupSlotRow>(
    `SELECT id, society_id, slot_date::text, slot_window AS window, start_time::text, end_time::text,
            capacity_total, capacity_remaining, COALESCE(is_active, TRUE) AS is_active
     FROM pickup_slots
     WHERE society_id = $1
       AND slot_date >= CURRENT_DATE
       AND capacity_remaining > 0
       AND COALESCE(is_active, TRUE) = TRUE
     ORDER BY slot_date ASC, start_time ASC`,
    [societyId],
  );
  return result.rows;
}

export async function findSlotById(slotId: string) {
  return queryOne<DbPickupSlotRow>(
    `SELECT id, society_id, slot_date::text, slot_window AS window, slot_window,
            start_time::text, end_time::text,
            capacity_total, capacity_remaining, COALESCE(is_active, TRUE) AS is_active
     FROM pickup_slots WHERE id = $1`,
    [slotId],
  );
}

export async function decrementSlotCapacity(slotId: string) {
  await query(
    `UPDATE pickup_slots SET capacity_remaining = capacity_remaining - 1
     WHERE id = $1 AND capacity_remaining > 0 AND COALESCE(is_active, TRUE) = TRUE`,
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

export async function listAllSlotsBySociety(societyId: string) {
  const result = await query<DbPickupSlotRow>(
    `SELECT id, society_id, slot_date::text, slot_window AS window, start_time::text, end_time::text,
            capacity_total, capacity_remaining, COALESCE(is_active, TRUE) AS is_active
     FROM pickup_slots
     WHERE society_id = $1 AND slot_date >= CURRENT_DATE - INTERVAL '1 day'
     ORDER BY slot_date ASC, start_time ASC`,
    [societyId],
  );
  return result.rows;
}

export async function createManagedSlot(data: {
  societyId: string;
  slotDate: string;
  slotWindow: string;
  startTime: string;
  endTime: string;
  capacityTotal: number;
}) {
  return queryOne(
    `INSERT INTO pickup_slots (society_id, slot_date, slot_window, start_time, end_time, capacity_total, capacity_remaining, is_active)
     VALUES ($1, $2, $3, $4::time, $5::time, $6, $6, TRUE) RETURNING *`,
    [
      data.societyId,
      data.slotDate,
      data.slotWindow,
      data.startTime,
      data.endTime,
      data.capacityTotal,
    ],
  );
}

export async function updateManagedSlot(
  slotId: string,
  data: {
    slotDate?: string;
    slotWindow?: string;
    startTime?: string;
    endTime?: string;
    capacityTotal?: number;
    isActive?: boolean;
  },
) {
  const current = await findSlotById(slotId);
  if (!current) return null;

  const capacityTotal = data.capacityTotal ?? current.capacity_total;
  const used = current.capacity_total - current.capacity_remaining;
  const capacityRemaining = Math.max(0, capacityTotal - used);

  return queryOne(
    `UPDATE pickup_slots SET
       slot_date = COALESCE($2::date, slot_date),
       slot_window = COALESCE($3, slot_window),
       start_time = COALESCE($4::time, start_time),
       end_time = COALESCE($5::time, end_time),
       capacity_total = $6,
       capacity_remaining = $7,
       is_active = COALESCE($8, is_active)
     WHERE id = $1
     RETURNING *`,
    [
      slotId,
      data.slotDate ?? null,
      data.slotWindow ?? null,
      data.startTime ?? null,
      data.endTime ?? null,
      capacityTotal,
      capacityRemaining,
      data.isActive ?? null,
    ],
  );
}

export async function deleteManagedSlot(slotId: string) {
  const booked = await queryOne<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM pickups WHERE pickup_slot_id = $1`,
    [slotId],
  );
  if (parseInt(booked?.c ?? "0", 10) > 0) {
    return queryOne(
      `UPDATE pickup_slots SET is_active = FALSE, capacity_remaining = 0 WHERE id = $1 RETURNING *`,
      [slotId],
    );
  }
  await query(`DELETE FROM pickup_slots WHERE id = $1`, [slotId]);
  return { id: slotId, deleted: true };
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
