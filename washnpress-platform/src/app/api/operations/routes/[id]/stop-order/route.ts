import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { updateRouteStopOrder } from "@/backend/repositories/operations";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ stopIds: z.array(z.string().uuid()) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("stopIds required");
  const stops = await updateRouteStopOrder(id, parsed.data.stopIds);
  return ok({ stops });
}