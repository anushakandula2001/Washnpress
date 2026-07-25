import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { downgradeSubscription } from "@/backend/repositories/subscriptions-ext";
import { ok, badRequest, notFound } from "@/backend/api/response";

const schema = z.object({ planId: z.string().uuid() });

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const sub = await downgradeSubscription(auth.session.residentId!, parsed.data.planId);
  if (!sub) return notFound("No active subscription");
  return ok({ subscription: sub, prorationNote: "Proration applied on next cycle" });
}