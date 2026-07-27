import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { createOperatorIssue } from "@/backend/repositories/operations";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({ description: z.string().min(10), orderId: z.string().uuid().optional() });

export async function POST(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("description required");
  const issue = await createOperatorIssue(auth.session.userId, parsed.data.description, parsed.data.orderId);
  return created({ issue });
}