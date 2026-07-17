import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { listTicketsByResident, createTicket } from "@/backend/repositories/support";
import { ok, unauthorized, badRequest, created } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const tickets = await listTicketsByResident(session.residentId!);
  return ok({ tickets });
}

const createSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(10),
  orderId: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  const ticket = await createTicket({
    residentId: session.residentId!,
    category: parsed.data.category,
    description: parsed.data.description,
    orderId: parsed.data.orderId,
    priority: parsed.data.priority,
  });

  return created({ ticket });
}
