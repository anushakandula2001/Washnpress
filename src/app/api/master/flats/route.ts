import { withErrorHandling } from "@/backend/api/response";
import { listFlatsByFloor } from "@/backend/repositories/master-data";
import { ok, badRequest } from "@/backend/api/response";

async function _GET(request: Request) {
  const floorId = new URL(request.url).searchParams.get("floorId");
  if (!floorId) return badRequest("floorId is required");
  const flats = await listFlatsByFloor(floorId);
  return ok({
    flats: flats.map((f) => ({
      id: f.id,
      flatNumber: f.flat_number,
      status: f.status,
    })),
  });
}


export const GET = withErrorHandling(_GET);
