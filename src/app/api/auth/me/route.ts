import { getSession } from "@/backend/api/session";
import { ok, unauthorized, serverError } from "@/backend/api/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    return ok({ user: { ...session, roles: session.roles ?? [] } });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Failed to load session");
  }
}
