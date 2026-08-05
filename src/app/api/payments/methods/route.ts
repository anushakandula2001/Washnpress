import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { addPaymentMethod } from "@/backend/repositories/billing-ext";
import { listPaymentMethods } from "@/backend/repositories/billing";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({
  brand: z.string(), last4: z.string().length(4),
  expiryMonth: z.number().min(1).max(12), expiryYear: z.number().min(2024),
  isDefault: z.boolean().optional(),
});

async function _GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  return ok({ methods: await listPaymentMethods(auth.session.residentId!) });
}

async function _POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const method = await addPaymentMethod({ residentId: auth.session.residentId!, ...parsed.data });
  return created({ method });
}

export const GET = withErrorHandling(_GET);
export const POST = withErrorHandling(_POST);
