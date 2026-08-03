import { withErrorHandling } from "@/backend/api/response";
import { getSession } from "@/backend/api/session";
import { ok, unauthorized, serverError } from "@/backend/api/response";

async function _GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    return ok({ user: { ...session, roles: session.roles ?? [] } });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Failed to load session");
  }
}


export const GET = withErrorHandling(_GET);
