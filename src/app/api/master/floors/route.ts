import { withErrorHandling } from "@/backend/api/response";
import { listFloorsByTower } from "@/backend/repositories/master-data";
import { ok, badRequest } from "@/backend/api/response";

async function _GET(request: Request) {
  const towerId = new URL(request.url).searchParams.get("towerId");
  if (!towerId) return badRequest("towerId is required");
  const floors = await listFloorsByTower(towerId);
  return ok({
    floors: floors.map((f) => ({
      id: f.id,
      floorNumber: f.floor_number,
      label: f.label,
      status: f.status,
    })),
  });
}


export const GET = withErrorHandling(_GET);
