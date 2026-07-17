import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { setAutoRenew } from "@/backend/repositories/subscriptions-ext";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ autoRenew: z.boolean() });

export async function PATCH(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const sub = await setAutoRenew(auth.session.residentId!, parsed.data.autoRenew);
  return ok({ subscription: sub });
}