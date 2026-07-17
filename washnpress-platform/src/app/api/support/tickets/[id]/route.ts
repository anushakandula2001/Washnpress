import { requireResident } from "@/backend/api/guards";
import { getTicketDetail } from "@/backend/repositories/profile-ext";
import { ok, notFound } from "@/backend/api/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const detail = await getTicketDetail(id, auth.session.residentId!);
  if (!detail) return notFound("Ticket not found");
  return ok(detail);
}