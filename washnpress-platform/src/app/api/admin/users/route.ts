import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { listUsers, createStaffUser, listOperatorsDetailed } from "@/backend/repositories/admin";
import { ok, created, badRequest } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const type = new URL(request.url).searchParams.get("type");
  if (type === "operators") {
    return ok({ operators: await listOperatorsDetailed() });
  }
  return ok({ users: await listUsers() });
}

const communitySchema = z.object({
  societyName: z.string().min(2),
  towerName: z.string().min(1),
  address: z.string().min(3),
  flatUnit: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  // legacy optional fields (ignored by UI)
  block: z.string().optional(),
  floor: z.string().optional(),
  flatRange: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const createSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  roles: z.array(z.enum(["resident", "operator", "admin"])).min(1),
  status: z.enum(["active", "inactive"]).default("active"),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  societyIds: z.array(z.string().uuid()).optional(),
  community: communitySchema.optional(),
  branch: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  if (
    parsed.data.roles.includes("operator") &&
    !parsed.data.community &&
    !parsed.data.societyIds?.length
  ) {
    return badRequest("Community / society details are required for operators");
  }

  try {
    const user = await createStaffUser({
      phone: parsed.data.phone,
      fullName: parsed.data.fullName,
      email: parsed.data.email || undefined,
      roles: parsed.data.roles,
      status: parsed.data.status,
      gender: parsed.data.gender,
      dateOfBirth: parsed.data.dateOfBirth,
      addressLine1: parsed.data.community?.address || parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2,
      city: parsed.data.community?.city || parsed.data.city,
      state: parsed.data.community?.state || parsed.data.state,
      pincode: parsed.data.community?.pincode || parsed.data.pincode,
      societyIds: parsed.data.societyIds,
      community: parsed.data.community
        ? {
            ...parsed.data.community,
            address: parsed.data.community.address,
            flatUnit: parsed.data.community.flatUnit,
          }
        : undefined,
    });
    return created({
      user,
      operatorCode: (user as { operatorCode?: string | null }).operatorCode ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    // Idempotent-ish: duplicate phone returns clear conflict instead of 500
    if (message.toLowerCase().includes("already exists")) {
      return badRequest(message);
    }
    return badRequest(message);
  }
}
