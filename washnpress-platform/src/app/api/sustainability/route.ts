import { getSessionFromRequest } from "@/backend/api/session";
import { getSustainabilitySummary } from "@/backend/repositories/billing";
import { summarizeWaterLogs } from "@/lib/domain";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (session?.residentId) {    const logs = await getSustainabilitySummary(session.residentId);
    const summary = summarizeWaterLogs(
      logs.map((l) => ({
        orderId: "db",
        garmentCount: l.garment_count,
        actualLitersUsed: parseFloat(l.actual_liters_used),
        baselineLitersPerGarment: parseFloat(l.baseline_liters_per_garment),
      })),
    );
    return ok(summary);
  }

  const { waterLogs } = await import("@/lib/mock-data");
  const { summarizeWaterLogs: summarize } = await import("@/lib/domain");
  return ok(summarize(waterLogs));
}
