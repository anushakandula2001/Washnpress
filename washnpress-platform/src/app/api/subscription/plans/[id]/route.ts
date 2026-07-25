import { requireResident } from "@/backend/api/guards";
import { findPlanById } from "@/backend/repositories/subscriptions";
import { toPlanResponse } from "@/backend/api/transformers";
import { ok, notFound } from "@/backend/api/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const plan = await findPlanById(id);
  if (!plan) return notFound("Plan not found");
  return ok({ plan: toPlanResponse(plan) });
}