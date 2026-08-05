import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { subscribeResident } from "@/backend/repositories/subscriptions-ext";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({ planId: z.string().uuid() });

async function _POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const sub = await subscribeResident(auth.session.residentId!, parsed.data.planId);
  return created({ subscription: sub });
}

export const POST = withErrorHandling(_POST);
