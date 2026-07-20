import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, created } from "@/backend/api/response";
import {
  listPlansAdmin,
  upsertPlan,
  setPlanActive,
  deletePlan,
} from "@/backend/repositories/admin-commerce";
import { query } from "@/backend/db/pool";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const plans = await listPlansAdmin(true);
  const enrollments = (
    await query(
      `SELECT sub.id, sub.status, sub.cycle_start, sub.cycle_end, sub.garments_used,
              pl.tier, pl.name AS plan_name, pl.monthly_inr::float, pl.garment_cap,
              r.id AS resident_id, u.full_name, u.phone, s.name AS society_name
       FROM subscriptions sub
       JOIN plans pl ON pl.id = sub.plan_id
       JOIN residents r ON r.id = sub.resident_id
       JOIN users u ON u.id = r.user_id
       JOIN societies s ON s.id = r.society_id
       ORDER BY sub.cycle_start DESC
       LIMIT 200`,
    )
  ).rows;

  return ok({ plans, enrollments });
}

const schema = z.object({
  id: z.string().uuid().optional(),
  tier: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  monthlyInr: z.number().min(0),
  quarterlyInr: z.number().min(0).optional(),
  yearlyInr: z.number().min(0).optional(),
  garmentCap: z.number().int().positive(),
  maxPickups: z.number().int().positive().optional(),
  turnaroundHours: z.number().int().positive().optional(),
  priorityPickup: z.boolean().optional(),
  freeDelivery: z.boolean().optional(),
  expressDiscountPercent: z.number().min(0).optional(),
  validityDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  action: z.enum(["upsert", "delete", "toggle"]).default("upsert"),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const p = parsed.data;
  try {
    if (p.action === "delete" && p.id) return ok({ result: await deletePlan(p.id) });
    if (p.action === "toggle" && p.id) {
      return ok({ plan: await setPlanActive(p.id, Boolean(p.isActive)) });
    }
    return created({ plan: await upsertPlan(p) });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Failed");
  }
}
