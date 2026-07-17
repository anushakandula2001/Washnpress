import { listSocietiesNearby } from "@/backend/repositories/societies-ext";
import { ok, badRequest } from "@/backend/api/response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lng = parseFloat(url.searchParams.get("lng") ?? "");
  const radius = parseFloat(url.searchParams.get("radiusKm") ?? "5");
  if (isNaN(lat) || isNaN(lng)) return badRequest("lat and lng required");
  const societies = await listSocietiesNearby(lat, lng, radius);
  return ok({ societies });
}