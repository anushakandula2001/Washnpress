import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest } from "@/backend/api/response";
import {
  getPlatformSettings,
  setPlatformSetting,
} from "@/backend/repositories/admin-commerce";

async function _GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  return ok({ settings: await getPlatformSettings() });
}

const schema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

async function _PUT(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request");
  const row = await setPlatformSetting(parsed.data.key, parsed.data.value);
  return ok({ setting: row });
}


export const GET = withErrorHandling(_GET);
export const PUT = withErrorHandling(_PUT);
