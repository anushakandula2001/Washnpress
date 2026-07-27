"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Ready for Delivery"
      description="Orders packed and waiting for delivery dispatch."
      stageLabel="Ready"
      filterStatuses={["Ready for Delivery"]}
      nextByStatus={{
        "Ready for Delivery": { status: "Out for Delivery", label: "Confirm Dispatch" },
      }}
    />
  );
}
