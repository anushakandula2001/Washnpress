import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { upgradeSubscription, pauseSubscription, cancelSubscription, resumeSubscription } from "@/backend/repositories/subscriptions";
import { toSubscriptionResponse } from "@/backend/api/transformers";
import { ok, unauthorized, badRequest, notFound } from "@/backend/api/response";

const upgradeSchema = z.object({ planId: z.string().uuid() });

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const body = await request.json();
  const parsed = upgradeSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  try {
    const sub = await upgradeSubscription(session.residentId!, parsed.data.planId);
    if (!sub) return notFound("Subscription not found");
    return ok({ subscription: toSubscriptionResponse(sub) });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Upgrade failed");
  }
}
