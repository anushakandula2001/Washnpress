import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { disputeOrder } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound, created } from "@/backend/api/response";
const schema = z.object({ reason: z.string().min(10), photoUrl: z.string().url().optional() });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const dispute = await disputeOrder(id, auth.session.residentId!, parsed.data.reason, parsed.data.photoUrl);
  if (!dispute) return notFound("Order not found");
  return created({ dispute });
}