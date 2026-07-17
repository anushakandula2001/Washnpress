import { requireResident } from "@/backend/api/guards";
import { cancelSubscription } from "@/backend/repositories/subscriptions";
import { ok, unauthorized, notFound } from "@/backend/api/response";

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const sub = await cancelSubscription(session.residentId!);
  if (!sub) return notFound("No active subscription");

  return ok({ cancelled: true, status: sub.status });
}
