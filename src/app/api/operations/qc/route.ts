import { z } from "zod";
import { getSessionFromRequest } from "@/backend/api/session";
import { updateOrderQc } from "@/backend/repositories/orders";import { createQcTicket, findOrderResidentId } from "@/backend/repositories/support";
import { ok, badRequest, unprocessable } from "@/backend/api/response";

const qcSchema = z.object({
  orderId: z.string().min(1),
  pass: z.boolean(),
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  const body = await request.json();
  const parsed = qcSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Invalid request", parsed.error.flatten());
  }

  if (!parsed.data.pass && !parsed.data.reason) {
    return unprocessable("QC fail reason is mandatory and opens a support ticket.");
  }

  const order = await updateOrderQc(
    parsed.data.orderId,
    parsed.data.pass,
    parsed.data.reason,
    session?.userId,
  );

  if (!order) {
    return badRequest("Order not found");
  }

  let supportTicketCreated = false;
  if (!parsed.data.pass && parsed.data.reason) {
    const orderResident = await findOrderResidentId(parsed.data.orderId);
    if (orderResident) {
      await createQcTicket({
        orderId: orderResident.order_id,
        residentId: orderResident.resident_id,
        reason: parsed.data.reason,
      });
      supportTicketCreated = true;
    }
  }

  return ok({
    orderId: parsed.data.orderId,
    status: order.status,
    supportTicketCreated,
  });
}
