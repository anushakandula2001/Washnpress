import { requireResident } from "@/backend/api/guards";
import { pauseSubscription, resumeSubscription } from "@/backend/repositories/subscriptions";
import { toSubscriptionResponse } from "@/backend/api/transformers";
import { ok, unauthorized, notFound, badRequest } from "@/backend/api/response";

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "pause";

  try {
    const sub = action === "resume"
      ? await resumeSubscription(session.residentId!)
      : await pauseSubscription(session.residentId!);

    if (!sub) return notFound("No active subscription");
    return ok({ subscription: toSubscriptionResponse(sub) });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Action failed");
  }
}
