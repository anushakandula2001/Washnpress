import { query, queryOne } from "@/backend/db/pool";
import { canCancelPickup } from "@/lib/domain";

export async function findPickupById(pickupId: string, residentId?: string) {
  const params: unknown[] = [pickupId];
  let sql = `SELECT * FROM pickups WHERE id = $1`;
  if (residentId) {
    sql += ` AND resident_id = $2`;
    params.push(residentId);
  }
  return queryOne(sql, params);
}

export async function cancelPickup(pickupId: string, residentId: string) {
  const pickup = await findPickupById(pickupId, residentId);
  if (!pickup) return null;

  const scheduled = (pickup as { scheduled_for: string }).scheduled_for;
  if (!canCancelPickup(scheduled, 2)) {
    throw new Error("Cannot cancel within 2 hours of pickup");
  }

  await query(
    `UPDATE pickups SET status = 'cancelled', updated_at = now() WHERE id = $1`,
    [pickupId],
  );
  return findPickupById(pickupId, residentId);
}

export async function setPickupRecurring(
  pickupId: string,
  residentId: string,
  recurring: boolean,
  recurringDay?: string,
) {
  await query(
    `UPDATE pickups SET recurring = $3, recurring_day = $4, updated_at = now()
     WHERE id = $1 AND resident_id = $2`,
    [pickupId, residentId, recurring, recurringDay ?? null],
  );
  return findPickupById(pickupId, residentId);
}
