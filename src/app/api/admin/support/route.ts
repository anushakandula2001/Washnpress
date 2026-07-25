import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest } from "@/backend/api/response";
import {
  listSupportTicketsFull,
  updateSupportTicket,
  addTicketReply,
  listTicketMessages,
} from "@/backend/repositories/admin-commerce";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const ticketId = new URL(request.url).searchParams.get("ticketId");
  if (ticketId) {
    return ok({
      messages: await listTicketMessages(ticketId),
      tickets: await listSupportTicketsFull(),
    });
  }
  return ok({ tickets: await listSupportTicketsFull() });
}

const schema = z.object({
  ticketId: z.string().uuid(),
  status: z.string().optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
  priority: z.string().optional(),
  reply: z.string().optional(),
});

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request");
  const ticket = await updateSupportTicket(parsed.data);
  if (parsed.data.reply) {
    await addTicketReply(parsed.data.ticketId, auth.session.userId, parsed.data.reply);
  }
  return ok({ ticket, messages: await listTicketMessages(parsed.data.ticketId) });
}
