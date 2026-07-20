"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Pickup Queue"
      description="Orders awaiting pickup completion at society."
      stageLabel="Pickup"
      filterStatuses={["Scheduled"]}
      nextByStatus={{
        Scheduled: { status: "Picked Up", label: "Mark Picked Up" },
      }}
    />
  );
}
