import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { applyReferral } from "@/backend/repositories/referrals";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ code: z.string().min(3) });

async function _POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid code");
  try {
    return ok(await applyReferral(parsed.data.code, auth.session.residentId!));
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Apply failed");
  }
}

export const POST = withErrorHandling(_POST);
