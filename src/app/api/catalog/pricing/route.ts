import { withErrorHandling } from "@/backend/api/response";
import { getSessionFromRequest } from "@/backend/api/session";
import { ok, unauthorized } from "@/backend/api/response";
import { getPublicPricingCatalog } from "@/backend/repositories/admin-commerce";

/** Authenticated catalog for Resident / Operator / Admin portals. */
async function _GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();
  return ok(await getPublicPricingCatalog());
}


export const GET = withErrorHandling(_GET);
