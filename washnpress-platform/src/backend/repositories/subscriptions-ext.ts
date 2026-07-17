import { query, queryOne } from "@/backend/db/pool";
import { findPlanById } from "@/backend/repositories/subscriptions";

export async function subscribeResident(residentId: string, planId: string) {
  await query(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = now()
     WHERE resident_id = $1 AND status IN ('active', 'paused')`,
    [residentId],
  );
  const plan = await findPlanById(planId);
  if (!plan) throw new Error("Plan not found");

  return queryOne(
    `INSERT INTO subscriptions (resident_id, plan_id, status, cycle_start, cycle_end, garments_used, auto_renew)
     VALUES ($1, $2, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 0, TRUE) RETURNING *`,
    [residentId, planId],
  );
}

export async function downgradeSubscription(residentId: string, planId: string) {
  const sub = await queryOne(
    `UPDATE subscriptions SET plan_id = $2, updated_at = now()
     WHERE resident_id = $1 AND status = 'active' RETURNING *`,
    [residentId, planId],
  );
  return sub;
}

export async function setAutoRenew(residentId: string, autoRenew: boolean) {
  return queryOne(
    `UPDATE subscriptions SET auto_renew = $2, updated_at = now()
     WHERE resident_id = $1 AND status IN ('active', 'paused') RETURNING *`,
    [residentId, autoRenew],
  );
}
