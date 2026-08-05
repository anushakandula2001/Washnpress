import { withErrorHandling } from "@/backend/api/response";
import { requireSession } from "@/backend/api/guards";
import { ok, notFound, badRequest, forbidden } from "@/backend/api/response";
import { queryOne } from "@/backend/db/pool";
import { upsertPlan, deletePlan } from "@/backend/repositories/admin-commerce";

async function _GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(request, "admin");
  if ("error" in auth) return auth.error;
  const roles = auth.session.roles ?? [];
  if (!roles.includes("admin") && !roles.includes("finance_admin") && !roles.includes("operator")) {
    return forbidden("Requires admin, finance_admin, or operator role");
  }

  const { id } = await context.params;

  const plan = await queryOne(`SELECT * FROM plans WHERE id = $1`, [id]);
  if (!plan) return notFound("Subscription plan not found");

  return ok({ plan });
}

async function _PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(request, "admin");
  if ("error" in auth) return auth.error;
  const roles = auth.session.roles ?? [];
  if (!roles.includes("admin") && !roles.includes("finance_admin")) {
    return forbidden("Requires admin or finance_admin role");
  }

  const { id } = await context.params;
  const body = await request.json();

  if (body.id && body.id !== id) {
    return badRequest("ID in body does not match URL parameter");
  }

  body.id = id;

  try {
    const result = await upsertPlan(body);
    return ok({ plan: result });
  } catch (err: any) {
    return badRequest(err.message || "Failed to update subscription plan");
  }
}

async function _DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(request, "admin");
  if ("error" in auth) return auth.error;
  const roles = auth.session.roles ?? [];
  if (!roles.includes("admin") && !roles.includes("finance_admin")) {
    return forbidden("Requires admin or finance_admin role");
  }

  const { id } = await context.params;

  try {
    const result = await deletePlan(id);
    return ok({ success: true, result });
  } catch (err: any) {
    return badRequest(err.message || "Failed to delete subscription plan");
  }
}

export const GET = withErrorHandling(_GET);
export const PUT = withErrorHandling(_PUT);
export const DELETE = withErrorHandling(_DELETE);
