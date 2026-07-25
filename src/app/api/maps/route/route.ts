import { requireRole } from "@/backend/api/guards";
import { getRouteStops } from "@/backend/repositories/operations";
import { ok, badRequest } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const routeId = new URL(request.url).searchParams.get("routeId");
  if (!routeId) return badRequest("routeId required");
  const stops = await getRouteStops(routeId);
  return ok({
    routeId,
    stops: (stops as Array<{ stop_sequence: number; order_code: string; status: string }>).map((s) => ({
      sequence: s.stop_sequence, orderCode: s.order_code, status: s.status,
    })),
    polyline: "encoded_polyline_placeholder",
  });
}