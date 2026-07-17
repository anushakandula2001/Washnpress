import { query, queryOne } from "@/backend/db/pool";
import type { DbPlan, DbSubscription } from "@/backend/types";

export async function listActivePlans() {
  const result = await query<DbPlan>(
    `SELECT id, tier, garment_cap, turnaround_hours, monthly_inr, annual_discount_percent, is_active
     FROM plans WHERE is_active = TRUE ORDER BY monthly_inr ASC`,
  );
  return result.rows;
}

export async function findPlanById(planId: string) {
  return queryOne<DbPlan>(
    `SELECT id, tier, garment_cap, turnaround_hours, monthly_inr, annual_discount_percent, is_active
     FROM plans WHERE id = $1`,
    [planId],
  );
}

export async function findPlanByTier(tier: string) {
  return queryOne<DbPlan>(
    `SELECT id, tier, garment_cap, turnaround_hours, monthly_inr, annual_discount_percent, is_active
     FROM plans WHERE tier = $1`,
    [tier],
  );
}

export async function findActiveSubscription(residentId: string) {
  return queryOne<DbSubscription>(
    `SELECT s.id, s.resident_id, s.plan_id, s.status, s.cycle_start, s.cycle_end,
            s.garments_used, s.auto_renew, p.tier, p.garment_cap, p.turnaround_hours, p.monthly_inr
     FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.resident_id = $1 AND s.status IN ('active', 'paused')
     ORDER BY s.created_at DESC LIMIT 1`,
    [residentId],
  );
}

export async function upgradeSubscription(residentId: string, planId: string) {
  const current = await findActiveSubscription(residentId);
  if (!current) {
    const plan = await findPlanById(planId);
    if (!plan) throw new Error("Plan not found");
    const result = await queryOne<DbSubscription>(
      `INSERT INTO subscriptions (resident_id, plan_id, status, cycle_start, cycle_end, garments_used, auto_renew)
       VALUES ($1, $2, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 0, TRUE)
       RETURNING id, resident_id, plan_id, status, cycle_start, cycle_end, garments_used, auto_renew,
                 $3::varchar AS tier, $4::int AS garment_cap, $5::int AS turnaround_hours, $6::numeric AS monthly_inr`,
      [residentId, planId, plan.tier, plan.garment_cap, plan.turnaround_hours, plan.monthly_inr],
    );
    return result;
  }

  await query(
    `UPDATE subscriptions SET plan_id = $2, updated_at = now() WHERE id = $1`,
    [current.id, planId],
  );
  return findActiveSubscription(residentId);
}

export async function pauseSubscription(residentId: string) {
  await query(
    `UPDATE subscriptions SET status = 'paused', updated_at = now()
     WHERE resident_id = $1 AND status = 'active'`,
    [residentId],
  );
  return findActiveSubscription(residentId);
}

export async function cancelSubscription(residentId: string) {
  await query(
    `UPDATE subscriptions SET status = 'cancelled', auto_renew = FALSE, updated_at = now()
     WHERE resident_id = $1 AND status IN ('active', 'paused')`,
    [residentId],
  );
  return findActiveSubscription(residentId);
}

export async function resumeSubscription(residentId: string) {
  await query(
    `UPDATE subscriptions SET status = 'active', updated_at = now()
     WHERE resident_id = $1 AND status = 'paused'`,
    [residentId],
  );
  return findActiveSubscription(residentId);
}
