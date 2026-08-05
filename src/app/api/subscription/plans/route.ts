import { withErrorHandling } from "@/backend/api/response";
import { requireResident } from "@/backend/api/guards";
import { listActivePlans, findActiveSubscription } from "@/backend/repositories/subscriptions";
import { toPlanResponse } from "@/backend/api/transformers";
import { ok, unauthorized } from "@/backend/api/response";

async function _GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const [plans, current] = await Promise.all([
    listActivePlans(),
    findActiveSubscription(session.residentId!),
  ]);

  return ok({
    plans: plans.map((p) => toPlanResponse(p, current?.plan_id)),
  });
}


export const GET = withErrorHandling(_GET);
