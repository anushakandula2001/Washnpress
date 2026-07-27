import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { createRefund } from "@/backend/repositories/admin";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({
  residentId: z.string().uuid(), amountInr: z.number().positive(),
  reason: z.string().min(5), orderId: z.string().uuid().optional(), approve: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const refund = await createRefund({
    residentId: parsed.data.residentId, orderId: parsed.data.orderId,
    amountInr: parsed.data.amountInr, reason: parsed.data.reason,
    approvedBy: parsed.data.approve ? auth.session.userId : undefined,
  });
  return created({ refund });
}