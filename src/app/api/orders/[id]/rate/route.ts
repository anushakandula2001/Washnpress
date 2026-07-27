import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { rateOrder } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound, created } from "@/backend/api/response";
const schema = z.object({ rating: z.number().min(1).max(5), comment: z.string().optional() });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const rating = await rateOrder(id, auth.session.residentId!, parsed.data.rating, parsed.data.comment);
  if (!rating) return notFound("Order not found");
  return created({ rating });
}