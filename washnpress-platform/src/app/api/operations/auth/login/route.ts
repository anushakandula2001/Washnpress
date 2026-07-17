import { z } from "zod";
import { operatorLogin } from "@/backend/repositories/operations";
import { createSession, SESSION_COOKIE } from "@/backend/api/session";
import { cookies } from "next/headers";
import { ok, badRequest, unauthorized } from "@/backend/api/response";

const schema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid phone");
  const user = await operatorLogin(parsed.data.phone);
  if (!user) return unauthorized("Not an operator or admin");
  const token = await createSession({
    userId: user.id, residentId: null, phone: user.phone, fullName: user.full_name,
    unitNumber: null, towerBlock: null, societyId: null, societyName: null, roles: user.roles,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60 });
  return ok({ user: { phone: user.phone, fullName: user.full_name, roles: user.roles } });
}