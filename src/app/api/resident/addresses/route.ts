import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { ok, badRequest } from "@/backend/api/response";
import { createResidentAddress, findResidentAddresses } from "@/backend/repositories/residents";

const addressSchema = z.object({
  label: z.string().trim().min(1).max(80),
  addressLine: z.string().trim().min(3).max(500),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/).optional(),
});

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  return ok({ addresses: await findResidentAddresses(auth.session.residentId!) });
}

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;

  const parsed = addressSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid address", parsed.error.flatten());

  const address = await createResidentAddress(auth.session.residentId!, parsed.data);
  return ok({ address });
}
