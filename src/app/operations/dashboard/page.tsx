import { DashboardClient } from "./DashboardClient";
import { getDashboardMetrics, getProcessingPipeline, getPickupStats, getRecentActivity } from "./actions";

export const dynamic = "force-dynamic";

export default async function OperationsDashboardPage() {
  const [metrics, pipeline, pickupStats, activity] = await Promise.all([
    getDashboardMetrics(),
    getProcessingPipeline(),
    getPickupStats(),
    getRecentActivity()
  ]);

  const initialData = {
    metrics,
    pipeline,
    pickupStats,
    activity
  };

  return <DashboardClient initialData={initialData} />;
}
