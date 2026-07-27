import { getSession } from "@/backend/api/session";
import { ok, unauthorized } from "@/backend/api/response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return ok({ user: session });
}
