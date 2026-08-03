import { withErrorHandling } from "@/backend/api/response";
import { cookies } from "next/headers";
import { ok } from "@/backend/api/response";
import { SESSION_COOKIE, destroySession } from "@/backend/api/session";

async function _POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await destroySession(token);
  }

  cookieStore.delete(SESSION_COOKIE);
  return ok({ loggedOut: true });
}


export const POST = withErrorHandling(_POST);
