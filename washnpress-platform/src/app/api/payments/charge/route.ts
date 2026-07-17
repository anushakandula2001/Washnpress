import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { createPaymentCharge } from "@/backend/repositories/billing-ext";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({
  amountInr: z.number().positive(),
  type: z.enum(["subscription", "order", "wallet_topup"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const txn = await createPaymentCharge({
    residentId: auth.session.residentId!,
    amountInr: parsed.data.amountInr,
    type: parsed.data.type,
    gatewayRef: `TXN-${Date.now()}`,
    metadata: parsed.data.metadata,
  });
  return created({ transaction: txn });
}