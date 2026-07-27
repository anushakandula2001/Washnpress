import { z } from "zod";
import { requireSession, hasRole } from "@/backend/api/guards";
import {
  createTower,
  createFloor,
  createFlat,
  listHierarchyForSociety,
  listServiceAreas,
  createServiceArea,
  listExecutiveAssignments,
  createExecutiveAssignment,
} from "@/backend/repositories/master-data";
import { listSocieties } from "@/backend/repositories/societies";
import { ok, created, badRequest, forbidden } from "@/backend/api/response";

async function requireOpsOrAdmin(request: Request) {
  const auth = await requireSession(request, "operator");
  if ("error" in auth) return auth;
  if (!hasRole(auth.session, "operator") && !hasRole(auth.session, "admin")) {
    return { error: forbidden("Requires operator or admin role") };
  }
  return auth;
}

export async function GET(request: Request) {
  const auth = await requireOpsOrAdmin(request);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const societyId = url.searchParams.get("societyId") ?? undefined;
  const type = url.searchParams.get("type") ?? "hierarchy";

  if (type === "service-areas") {
    return ok({ serviceAreas: await listServiceAreas(societyId) });
  }
  if (type === "executives") {
    return ok({ executives: await listExecutiveAssignments(societyId) });
  }
  if (type === "societies") {
    const societies = await listSocieties();
    return ok({ societies });
  }

  if (!societyId) return badRequest("societyId is required for hierarchy");
  return ok({ hierarchy: await listHierarchyForSociety(societyId) });
}

const towerSchema = z.object({
  kind: z.literal("tower"),
  societyId: z.string().uuid(),
  name: z.string().min(1),
});

const floorSchema = z.object({
  kind: z.literal("floor"),
  towerId: z.string().uuid(),
  floorNumber: z.number().int().min(0).max(200),
  label: z.string().optional(),
});

const flatSchema = z.object({
  kind: z.literal("flat"),
  floorId: z.string().uuid(),
  flatNumber: z.string().min(1),
});

const serviceAreaSchema = z.object({
  kind: z.literal("service-area"),
  societyId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
});

const executiveSchema = z.object({
  kind: z.literal("executive"),
  societyId: z.string().uuid(),
  fullName: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  serviceAreaId: z.string().uuid().optional(),
});

const createSchema = z.discriminatedUnion("kind", [
  towerSchema,
  floorSchema,
  flatSchema,
  serviceAreaSchema,
  executiveSchema,
]);

export async function POST(request: Request) {
  const auth = await requireOpsOrAdmin(request);
  if ("error" in auth) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  try {
    const data = parsed.data;
    switch (data.kind) {
      case "tower":
        return created({ tower: await createTower(data.societyId, data.name) });
      case "floor":
        return created({
          floor: await createFloor(data.towerId, data.floorNumber, data.label),
        });
      case "flat":
        return created({ flat: await createFlat(data.floorId, data.flatNumber) });
      case "service-area":
        return created({
          serviceArea: await createServiceArea({
            societyId: data.societyId,
            name: data.name,
            description: data.description,
          }),
        });
      case "executive":
        return created({
          executive: await createExecutiveAssignment({
            societyId: data.societyId,
            fullName: data.fullName,
            phone: data.phone,
            serviceAreaId: data.serviceAreaId,
          }),
        });
    }
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Create failed");
  }
}
