import { listTowersBySociety } from "@/backend/repositories/master-data";
import { ok, badRequest } from "@/backend/api/response";

export async function GET(request: Request) {
  const societyId = new URL(request.url).searchParams.get("societyId");
  if (!societyId) return badRequest("societyId is required");
  const towers = await listTowersBySociety(societyId);
  return ok({
    towers: towers.map((t) => ({ id: t.id, name: t.name, status: t.status })),
  });
}
