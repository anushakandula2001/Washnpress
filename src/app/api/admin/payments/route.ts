import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest } from "@/backend/api/response";
import {
  listPaymentsBundle,
  setRefundStatus,
} from "@/backend/repositories/admin-commerce";

async function _GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  return ok(await listPaymentsBundle());
}

const schema = z.object({
  refundId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

async function _PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request");
  const row = await setRefundStatus(
    parsed.data.refundId,
    parsed.data.status,
    auth.session.userId,
  );
  return ok({ refund: row });
}


export const GET = withErrorHandling(_GET);
export const PATCH = withErrorHandling(_PATCH);
