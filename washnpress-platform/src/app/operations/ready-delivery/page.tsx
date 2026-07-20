"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Ready for Delivery"
      description="Orders packed and waiting for delivery dispatch."
      stageLabel="Ready"
      filterStatuses={["Out for Delivery"]}
      nextByStatus={{
        "Out for Delivery": { status: "Delivered", label: "Confirm Dispatch" },
      }}
    />
  );
}
